/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 **/

'use strict';

const { command, checkConnection } = require('./managerIf');

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

const nzos_handlers = {
    'LaunchRequest': function() {
        console.log(this.context.appName);
        if (this.context.appName) {
            // this.emit('Launch');
            // Launch on default device? Or ask for device? How to know?
            this.emit(':ask', `Welcome to ${this.context.appPrompt || this.context.appName}, open on which device?`);
        }
        else {
            this.emit(':ask', 'Welcome to cloud OS, which APP would you like to launch, for example say "launch browser"?');
        }
    },
    'Launch': function () {
        console.log(this.context.appName);
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        // Hardcode this here as LaunchRequest doesn't have
        const name = 'Launch';
        const app = this.context.appName || request.intent.slots.App.value;
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
            command(session.user.userId, device.toLowerCase(), app, session.sessionId, name.toLowerCase(), 
                app, function(status, sessionId, response, parm) {
                    switch (status) {
                        case 0:
                            this.emit(':ask', `Ok, ${app} launched`);
                        break;
                        case 1:
                            this.emit(':ask', `I don't recognize your identity, what is your username?`);
                        break;
                        default:
                            this.emit(':tell', 'Failed to launch app');
                    }
                
                }.bind(this)); 
        }
    },
    'Move': function () {
        console.log(this.context.appName);
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        const app = this.context.appName || request.intent.slots.App.value;
        let device = request.intent.slots.Device.value;
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
        } else {
            command(session.user.userId, device.toLowerCase(), app, session.sessionId, name.toLowerCase(), 
                app, function(status, sessionId, response, parm) {
                    switch (status) {
                        case 0:
                            this.emit(':ask', `Ok, Moved to ${device}`);
                        break;
                        case 1:
                            this.emit(':ask', `I don't recognize your identity, what is your username?`);
                        break;
                        default:
                            this.emit(':tell', 'Failed to move app');
                    }
                
                }.bind(this)); 
        }
    },
    'Close': function () {
        console.log(this.context.appName);
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        const app = this.context.appName || request.intent.slots.App.value;
        if (!app) {
            let slotToElicit = 'App';
            let speechOutput = 'Which app would you like to close?';
            let repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        } else {
            command(session.user.userId, "", app, session.sessionId, name.toLowerCase(), 
                app, function(status, sessionId, response, parm) {
                    switch (status) {
                        case 0:
                            this.emit(':tell', `${app} closed`);
                        break;
                        case 1:
                            this.emit(':ask', `I don't recognize your identity, what is your username?`);
                        break;
                        default:
                            this.emit(':tell', 'Failed to close app');
                    }
                
                }.bind(this)); 
        }
    },
    'Identify': function() {
        console.log(this.context.appName);
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        const user = request.intent.slots.User.value;
        if (!user) {
            let slotToElicit = 'User';
            let speechOutput = "I don't recognize that user";
            let repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        } else {
            command(session.user.userId, "", appName, session.sessionId, name.toLowerCase(), 
                    user.toLowerCase(), function(status, sessionId, response, parm) {
                        switch(status) {
                            case 0:
                                this.emit(':ask', `User identity confirmed. Repeat your original request`);
                            break;
                            case 1:
                                response = response !== "" ? (":" + response) : ":ask";
                                parm = parm !== "" ? parm : `I don't recognize your identity, what is your username?`;
                                this.emit(response, parm);
                            break;
                            default:
                                this.emit(':tell', 'Failed to complete request');
                        }
                    
                    }.bind(this));
        }
    },
    'Unhandled': function() {
        console.log(this.context.appName);
        if (!checkConnection(this)) return;
        console.log("Unhandled");
        const {request, session} = this.event;
        const name = request.intent.name;
        
        const app = this.context.appName || (request.intent.slots.App ? request.intent.slots.App.value : undefined);
        
        if (!app && !request.intent.slots.App) {
            this.emit(':tell', `Cannot process action ${name} without app name`);
        }
        
        if (!app) {
            let slotToElicit = 'App';
            let speechOutput = 'Which app are acting on?';
            let repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        } else {
            // Fill in slots
            let params = [];
            const slots = request.intent.slots;
            if (slots) {
                let keys = Object.keys(slots);
                keys.forEach((key) => { if (key !== "App") params.push(slots[key].value); });
            }
            
            command(session.user.userId, "", app, session.sessionId, name.toLowerCase(), 
                params[0] || "", params[1] || "", params[2] || "", 
                params[3] || "", params[4] || "", function(status, sessionId, response, parm) {
                    response = ":" + (response !== "" ? response : "tell");
                    switch(status) {
                        case 0:
                            this.emit(response, parm !== "" ? parm : "Ok");
                        break;
                        case 1:
                            this.emit(':ask', `I don't recognize your identity, what is your username?`);
                        break;
                        default:
                            this.emit(response, parm !== "" ? parm : 'Failed to complete request');
                    }
            
                }.bind(this));
        }
    },
    'SessionEndedRequest': function() {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

module.exports = {nzos_app_id, nzos_handlers, nzos_strings};