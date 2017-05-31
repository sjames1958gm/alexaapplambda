
'use strict';

var { startClient } = require('./managerIf');

var startConnection = function(cb) {
    startClient(cb);
}

const Alexa = require('alexa-sdk');

var {presentations_handlers, presentations_app_id, presentations_strings} = require("./presentations");
var {nzos_handlers, nzos_app_id, nzos_strings} = require("./nzos");
var {telegram_handlers, telegram_app_id, telegram_strings} = require("./telegram");

exports.handler = function (event, context) {

    startConnection(() => {

    const alexa = Alexa.handler(event, context);
    let app = "";
    
    switch (event.session.application.applicationId) {
        case presentations_app_id:
            app = "presentations";
            alexa.appId = presentations_app_id;
            alexa.resources = presentations_strings;
            alexa.registerHandlers(presentations_handlers);
        break;
        case nzos_app_id:
            app = "cloud OS";
            alexa.appId = nzos_app_id;
            alexa.resources = nzos_strings;
            alexa.registerHandlers(nzos_handlers);
        break;
        case telegram_app_id:
            app = "telegram";
            alexa.appId = telegram_app_id;
            alexa.resources = telegram_strings;
            alexa.registerHandlers(telegram_handlers);
        break;
    }

    const { request } = event;
    console.log(request);
    console.log(`${new Date().toTimeString()}: skill ${app}`);
    console.log(`\tRequest type: ${request.type}`);
    if (request.type == 'IntentRequest') {
        let { intent } = request;
        let str = `\tIntent: ${intent.name} (`;
        if (intent.slots) {
            str += Object.keys(intent.slots).map((k) => (
                        `${k}: ${intent.slots[k].value}`
                    )).join(", ");
        }
        str += `)`;
        console.log(str);
    }

    alexa.execute();
    });
};
