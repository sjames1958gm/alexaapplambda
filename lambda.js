
'use strict';

var { startClient } = require('./managerIf');

var startConnection = function(cb) {
    startClient(cb);
}

const Alexa = require('alexa-sdk');

var {presentations_handlers, presentations_app_id, presentations_strings} = require("./presentations");
var {nzos_handlers, nzos_app_id, nzos_strings} = require("./nzos");
var {telegram_handlers, telegram_app_id, telegram_strings} = require("./telegram");

var latencyAppId = "amzn1.ask.skill.43994ac0-16d2-4804-8dd1-2beba59fba43";
var videoAppId = "amzn1.ask.skill.c8e79877-8278-4628-8076-4b7ed6b8bfef";

exports.handler = function (event, context) {
    console.log(JSON.stringify(event));

    startConnection(() => {

    const alexa = Alexa.handler(event, context);
    let app = "";
    
    switch (event.session.application.applicationId) {
        // case presentations_app_id:
        //     app = "presentations";
        //     alexa.appId = presentations_app_id;
        //     alexa.resources = presentations_strings;
        //     alexa.registerHandlers(presentations_handlers);
        // break;
        case presentations_app_id:
            app = "presentations";
            alexa.appId = presentations_app_id;
            alexa.resources = nzos_strings;
            alexa.registerHandlers(nzos_handlers);
            context.appName = "presentations";
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
        case latencyAppId:
            app = "Test App";
            alexa.appId = latencyAppId;
            alexa.resources = nzos_strings;
            alexa.registerHandlers(nzos_handlers);
            context.appName = "latency";
        break;
        case videoAppId:
            app = "Video";
            alexa.appId = videoAppId;
            alexa.resources = nzos_strings;
            alexa.registerHandlers(nzos_handlers);
            context.appName = "video";
            context.appPrompt = "video app";
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
