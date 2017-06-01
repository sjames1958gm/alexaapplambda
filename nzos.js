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
        this.emit(':ask', 'Welcome to cloud OS, which APP would you like to launch, for example say "launch browser"?');
    },
    'Launch': function () {
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        const app = request.intent.slots.App.value;
        let device = request.intent.slots.Device.value || "";
        if (!app) {
            var slotToElicit = 'App';
            var speechOutput = 'Which app would you like to open?';
            var repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        }
        else {
            command(session.user.userId, app, session.sessionId, name.toLowerCase(), 
                app, device.toLowerCase(), function(status, sessionId, response, parm) {
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
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        const app = request.intent.slots.App.value;
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
            command(session.user.userId, app, session.sessionId, name.toLowerCase(), 
                app, device.toLowerCase(), function(status, sessionId, response, parm) {
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
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        const app = request.intent.slots.App.value;
        if (!app) {
            let slotToElicit = 'App';
            let speechOutput = 'Which app would you like to close?';
            let repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        } else {
            command(session.user.userId, app, session.sessionId, name.toLowerCase(), 
                app, function(status, sessionId, response, parm) {
                    switch (status) {
                        case 0:
                            this.emit(':ask', `${app} closed`);
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
            command(session.user.userId, appName, session.sessionId, name.toLowerCase(), 
                    user.toLowerCase(), function(status, sessionId, response, parm) {
                        switch(status) {
                            case 0:
                                this.emit(':tell', `User identity confirmed. Repeat your original request`);
                            break;
                            case 1:
                                this.emit(':ask', `I don't recognize your identity, what is your username?`);
                            break;
                            default:
                                this.emit(':tell', 'Failed to complete request');
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