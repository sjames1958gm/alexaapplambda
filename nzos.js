/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 **/

'use strict';

const {
  command
} = require('./managerIf');

const nzos_app_id = "amzn1.ask.skill.d59e4dcf-92b7-4c4f-9ecc-ec93623a4d17";
const appName = "nzos";

const en = {
  translation: {
    SKILL_NAME: 'Doc viewer',
    HELP_MESSAGE: 'You can say launch application or you can say exit ... What can I help you with?',
    HELP_REPROMPT: 'What can I help you with?',
    STOP_MESSAGE: 'Goodbye!',
  },
};

const nzos_strings = {
  'en': en,
  'en-US': en
};

function slotValue(slot, useId){
    let value = slot.value;
    let resolution = (slot.resolutions && 
                      slot.resolutions.resolutionsPerAuthority && 
                      slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
    if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
        let resolutionValue = resolution.values[0].value;
        value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
    }
    return value;
}

function emitResponse(alexa, response, defaultResponse, parm, defaultParm) {
  response = ":" + (response !== "" ? response : defaultResponse);
  parm = parm !== "" ? parm : defaultParm;

  console.log(`emitReponse ${response}, ${parm}`);

  alexa.emit(response, parm);
}

function getUserId(session, context) {
  return context.accessToken ? context.accessToken :
    (session.user.accessToken ? session.user.accessToken : session.user.userId);
}

const nzos_handlers = {
  'LaunchRequest': function() {
    console.log(this.context.appName);
    if (this.context.appName) {
      this.emit('Launch');
      // Launch on default device? Or ask for device? How to know?
      // this.emit(':ask', `Welcome to ${this.context.appPrompt || this.context.appName}, open on which device?`);
    }
    else {
      // this.emit(':ask', 'Welcome to cloud OS, which APP would you like to launch, for example say "launch browser"?');
    }
  },

  'Launch': function() {
    console.log(this.context.appName);
    const {
      request,
      session
    } = this.event;
    console.log(`User: ${JSON.stringify(session.user)}`);
    // Hardcode this here as LaunchRequest doesn't have
    const name = 'Launch';
    const app = this.context.appName || slotValue(request.intent.slots.App);
    let device = "";
    if (request.intent &&
      request.intent.slots.Device &&
      request.intent.slots.Device.value) {

      device = request.intent.slots.Device.value;
    }

    if (!app) {
      var slotToElicit = 'App';
      var speechOutput = 'Which app would you like to open?';
      var repromptSpeech = speechOutput;
      this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else {
      command(this.context.handle, getUserId(session, this.context), device.toLowerCase(), app, session.sessionId, name.toLowerCase(),
        app,
        function(sessionId, responseType, response) {
          emitResponse(this, responseType, "ask", response, `Ok`);
        }.bind(this));
    }
  },

  'Move': function() {
    console.log(this.context.appName);
    const {
      request,
      session
    } = this.event;
    const name = request.intent.name;
    const app = this.context.appName || slotValue(request.intent.slots.App);
    let device = slotValue(request.intent.slots.Device);
    if (!app) {
      let slotToElicit = 'App';
      let speechOutput = 'Which app would you like to move?';
      let repromptSpeech = speechOutput;
      this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else if (!device) {
      let slotToElicit = 'Device';
      let speechOutput = 'Move the app to which device?';
      let repromptSpeech = speechOutput;
      this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else {
      command(this.context.handle, getUserId(session, this.context), device.toLowerCase(), app, session.sessionId, name.toLowerCase(),
        app,
        function(sessionId, responseType, response) {
          emitResponse(this, responseType, "ask", response, `Ok`);
        }.bind(this));
    }
  },

  'Close': function() {
    console.log(this.context.appName);
    const {
      request,
      session
    } = this.event;
    const name = request.intent.name;
    const app = this.context.appName || slotValue(request.intent.slots.App);
    if (!app) {
      let slotToElicit = 'App';
      let speechOutput = 'Which app would you like to close?';
      let repromptSpeech = speechOutput;
      this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else {
      command(this.context.handle, getUserId(session, this.context), "", app, session.sessionId, name.toLowerCase(),
        app,
        function(sessionId, responseType, response) {
          emitResponse(this, responseType, "ask", response, `Ok`);
        }.bind(this));
    }
  },

  'Identify': function() {
    console.log(this.context.appName);
    const {
      request,
      session
    } = this.event;
    const name = request.intent.name;
    const user = request.intent.slots.User.value;
    if (!user) {
      let slotToElicit = 'User';
      let speechOutput = "I don't recognize that user";
      let repromptSpeech = speechOutput;
      this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else {
      command(this.context.handle, getUserId(session, this.context), "", appName, session.sessionId, name.toLowerCase(),
        user.toLowerCase(),
        function(sessionId, responseType, response) {
          emitResponse(this, responseType, "ask", response, `Ok`);
        }.bind(this));
    }
  },
  
  'Unhandled': function() {
    console.log(this.context.appName);
    const {
      request,
      session
    } = this.event;

    console.log(`Unhandled - ${request.intent ? request.intent.name : 'no intent'}`);

    const name = request.intent.name;
    const app = this.context.appName || (request.intent.slots.App ? slotValue(request.intent.slots.App) : undefined);

    let device = "";

    if (!app && !request.intent.slots.App) {
      this.emit(':tell', `Cannot process action ${name} without app name`);
    }

    if (!app) {
      let slotToElicit = 'App';
      let speechOutput = 'Send request to which application?';
      let repromptSpeech = speechOutput;
      this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
    }
    else {
      // Fill in slots
      let params = [];
      const slots = request.intent.slots;
      if (slots) {
        let keys = Object.keys(slots).sort((a,b) => (a < b) ? -1 : 1);
        console.log(keys);
        keys.forEach((key) => {
          if (key === "Device") {
            device = slotValue(slots[key]) || "";
          }
          else if (key !== "App") {
            params.push(slotValue(slots[key]));
          }
        });
      }
      
      console.log(params);

      command(this.context.handle, getUserId(session, this.context), device.toLowerCase(), app, session.sessionId, name.toLowerCase(),
        params[0] || "", params[1] || "", params[2] || "",
        params[3] || "", params[4] || "",
        function(sessionId, responseType, response) {
          emitResponse(this, responseType, "ask", response, `Ok`);
        }.bind(this));
    }
  },
  
  'SessionEndedRequest': function() {
      this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'AMAZON.HelpIntent': function() {
    const speechOutput = this.t('HELP_MESSAGE');
    const reprompt = this.t('HELP_MESSAGE');
    this.emit(':ask', speechOutput, reprompt);
  },
  
  'AMAZON.CancelIntent': function() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  
  'AMAZON.StopIntent': function() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
};

module.exports = {
  nzos_app_id,
  nzos_handlers,
  nzos_strings,
  slotValue 
};
