(function (global) {

  "use strict";

  function init(ProtoBuf, Protocol) {
    // console.log("ProtoBuf" + ProtoBuf);
    // console.log("Protocol" + JSON.stringify(Protocol));

    var nzappapi = {};

    var root = undefined;
    var initialized = false;
    
    var connections = {};
    
    var Msgs = {};
    var MsgIds = {};

    // nzappapi.ByteBuffer = ByteBuffer;

    // // Node Buffers have BE write, Array Buffers do not.
    // if (ByteBuffer.writeUInt32BE) {
    //   ByteBuffer.writeUInt32BE = ByteBuffer.writeUInt32;
    // }

    // Big endian read
    function readUInt32(abuff, offset) {
      var buffer = new Uint8Array(abuff);
      var value = 0;
      for (var i = offset; i < offset + 4; i++) {
               value = (value << 8) + buffer[i];
      }
      return value;
    }

    // Big endian write
    function writeUInt32(value, abuff, offset) {
      var buffer = new Uint8Array(abuff);
      for (var i = offset + 3; i >= offset; i--) {
               buffer[i] = value & 0xFF;
               value = value >> 8;
      }
    }

    function append(abuff, data, offset) {
      var buffer = new Uint8Array(abuff);
      for (var i = 0; i < data.length; i++) {
               buffer[i + offset] = data[i];
      }
    }

    function sendRpcMsg(obj) {
      if (obj.handle.connected) {
        var encodedBuffer = obj.buffer;
        var msgId = obj.msgId;
        var abuff = new ArrayBuffer(8 + encodedBuffer.length);
        writeUInt32(encodedBuffer.length, abuff, 0);
        writeUInt32(msgId, abuff, 4);
        append(abuff, encodedBuffer, 8);
        if (obj.handle.clientOptions.type === "tcp") {
          // console.log(Buffer.from(abuff));
          obj.handle.socket.write(Buffer.from(abuff));
        }
        else {
          // Websocket
        }
        return true;
      } else {
        if (obj.retry > 0) {
          obj.retry--;
          setTimeout(sendRpcMsg, 50, obj);
        } else {
          console.log("Cannot send App Message - no connection");
        }
      }
    }

    nzappapi.connect = function(clientOptions, cbs) {
      
      let handle = connections[clientOptions.host + ":" + clientOptions.port];
      
      if (handle && handle.connected) 
      {
        handle.ts = Date.now();
        // callback with asynchronous behavior.
        if (cbs.onOpen)
          setTimeout(() => cbs.onOpen(handle), 0);
          
        return;
      }
      
      if (clientOptions.type === "tcp") {
        let socket = new clientOptions.constructor();
        
        let handle = {
          socket:socket,
          cbs: cbs,
          connected: false,
          clientOptions: clientOptions,
          ts: Date.now()
        };
        
        connections[clientOptions.host + ":" + clientOptions.port] = handle;
        
        socket.connect(clientOptions.port, clientOptions.host, function() {
          console.log('Connected');
          handle.connected = true;
          if (handle.cbs.onOpen) handle.cbs.onOpen(handle);
        });

        socket.on("close", function () {
          console.log("Disconnected");
          handle.connected = false;
          if (handle.cbs.onClose)
            handle.cbs.onClose();
          
        });

        socket.on("end", function () {
          console.log("Ended");
          handle.connected = false;
        });

        socket.on("error", function () {
          console.log("Error on connection");
          handle.connected = false;
          if (handle.cbs.onError) 
            handle.cbs.onError();
        });

        let size = 0;
        socket.on("data", function (buffer) {
          try {
            // console.log(`On Data, buffer len: ${buffer.length}`);
            if (size == 0) {
              size = readUInt32(buffer, 0);
              // console.log(`On Data, size: ${size}`);
              buffer = buffer.slice(4);
              if (buffer.length > 0) {
                // console.log("Full buffer");
                processRpc(socket, size, buffer);
                size = 0;
              }
            }
            else {
              processRpc(socket, size, buffer);
              size = 0;
            }
          } catch (err) {
            console.log("error: ", err);
          }
        });
      }
      // todo websocket

    };

    function processRpc(socket, len, buffer) {
      var msgId = readUInt32(buffer, 0);
      // TODO: verify length vs len?
      // console.log(" len: ", len);
      // console.log(" msgId: ", msgId);

      // console.log(`MsgLen ${len}`);
                                           // console.log(`MsgId ${msgId}`);
      // console.log(`Buffer: ${buffer.length}`)
      var name = MsgIds[msgId];
      if (!name) {
        console.log("no message for id: " + msgId);
        socket.end();
        return;
      }
      var messageObj = Msgs[name];

      if (messageObj.cb) {
        var message = messageObj.message.decode(buffer.slice(4));
        if (message) {
          var parms = [];
          messageObj.parms.forEach(function(p) {
            parms.push(message[p]);
          });
          messageObj.cb.apply(null, parms);
        }
        else {
          console.log('Invalid message recevied: ' + msgId);
        }
      }
    }

    function SendMessage(handle, msgId, message, parms) {
      var rest = Array.prototype.slice.call(arguments, 4);
      if (initialized) {
        // console.log(rest);
        // console.log(parms);
        var obj = {};
        for (var i = 0; i < parms.length && i < rest.length; i++) {
          obj[parms[i]] = rest[i];
        }
        var m = message.create(obj);
        // console.log(m);
        var buffer = message.encode(m).finish();
        // console.log(buffer);
        return sendRpcMsg({ handle:handle, buffer:buffer, msgId:msgId, retry: 5 });
      } else {
        throw "API not intialized";
      }
    }

    //-----------------------------------------------------
    // - API functions (some generated from Protocol)
    //-----------------------------------------------------

    function LoadProtocol(callbacks) {
                      // Load messages from proto file create functions
      Protocol.messages.forEach(function(m, i) {
        var id = Protocol.baseMsgId + 1 + i;
        var message = root.lookup(Protocol.namespace + "." + m.name);
        Msgs[m.name] = {id: id};
        Msgs[m.name].message = message;
        Msgs[m.name].cb = callbacks[m.name];
        // Msgs[m.name].parms = m.parms;
        var parms = [];
        if (!message) console.log(m.name);
        message.fieldsArray.forEach(function(f) {
          parms.push(f.name);
        });
        Msgs[m.name].parms = parms;

        // Set up object for msgId to message
        MsgIds[id] = m.name;

        // Create the message sending functions
        nzappapi[m.name] = function(msgId, message, parms) {
          return function(handle) {

            var p = [handle, msgId, message, parms];
            for (var i = 1; i < arguments.length; i++) {
              p.push(arguments[i]);
            }
            SendMessage.apply(null, p);
          };
        }(id, message, parms);
      });
    }

    nzappapi.Initialize = function (protofile, callbacks) {
      
      // Start timer to clear idle sockets.
      
      ProtoBuf.load(protofile, function(err, locroot) {
        if (err) throw err;
        root = locroot;
        LoadProtocol(callbacks);
        initialized = true;
      });
    };

    return nzappapi;
  }

  if (typeof require === 'function' &&
      typeof module === 'object' && module &&
      typeof exports === 'object' && exports)
    module['exports'] = init(require("protobufjs"), require("./nzappapiproto.js"));
  else
    (global = global || {})["nzappapi"] =
      init(global["protobuf"], global["netzyn"]["nzappapiproto"]);

} (this));

