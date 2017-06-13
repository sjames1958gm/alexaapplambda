/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 **/

'use strict';

const { command, checkConnection } = require('./managerIf');

const presentations_app_id = "amzn1.ask.skill.bcaf523d-4c04-450f-9f6b-20c40c5ec1d8";
const appName = "presentations";

const en = {
        translation: {
            SKILL_NAME: 'Doc viewer',
            HELP_MESSAGE: 'You can say open document, page, scroll or you can say exit ... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    };

const presentations_strings = {
    'en': en,
    'en-US': en
};

const presentations_handlers = {
    'LaunchRequest': function() {
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        command(session.user.userId, "", appName, session.sessionId, 'Launch'.toLowerCase(), 
            function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        this.emit(':ask', `Ok.`);
                    break;
                    case 1:
                        this.emit(':ask', `I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        this.emit(':tell', 'Failed to open document');
                }
            
            }.bind(this));        
    },
    'Launch': function() {
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        const device = request.intent.slots.Device.value;
        command(session.user.userId, device.toLowerCase(), appName, session.sessionId, name.toLowerCase(), 
            "", function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        this.emit(':ask', `Ok.`);
                    break;
                    case 1:
                        this.emit(':ask', `I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        this.emit(':tell', 'Failed to open document');
                }
            
            }.bind(this));        
    },
    'Show': function () {
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        let document = request.intent.slots.Document.value;
        const home = request.intent.slots.Home.value;
        const device = request.intent.slots.Device.value || "";
        if (!document && !home) {
            var slotToElicit = 'Document';
            var speechOutput = 'Which document would you like to show?';
            var repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        }
        else {
            if (!document) {
                // Assume home is set - and set document to all.
                document = "all";
            }
            command(session.user.userId, device.toLowerCase(), appName, session.sessionId, name.toLowerCase(), 
                document, function(status, sessionId, response, parm) {
                    switch (status) {
                        case 0:
                            this.emit(':ask', `Ok`);
                        break;
                        case 1:
                            this.emit(':ask', `I don't recognize your identity, what is your username?`);
                        break;
                        default:
                            this.emit(':tell', 'Failed to open document');
                    }
                
                }.bind(this));
        }
    },
    'Move': function () {
        if (!checkConnection(this)) return;
        // console.log(this.event);
        const {request, session} = this.event;
        const name = request.intent.name;
        const device = request.intent.slots.Device.value;
        if (!device) {
            var slotToElicit = 'Device';
            var speechOutput = 'Move to which device?';
            var repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        }
        else {
            command(session.user.userId, device.toLowerCase(), appName, 
                session.sessionId, name.toLowerCase(), 
                function(status, sessionId, response, parm) {
                    switch (status) {
                        case 0:
                            this.emit(':ask', `Ok, presentation moved to ${device}`);
                        break;
                        default:
                            this.emit(':tell', 'Failed to move document');
                    }
                
                }.bind(this));
        }
    },
    'Go': function () {
        if (!checkConnection(this)) return;
        // console.log(this.event);
        const {request, session} = this.event;
        const name = request.intent.name;
        const direction = request.intent.slots.Direction.value;
        if (!direction) {
            var slotToElicit = 'Direction';
            var speechOutput = 'Next or previous page?';
            var repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        }
        else {
            command(session.user.userId, "", appName, session.sessionId, name.toLowerCase(), 
                direction, function(status, sessionId, response, parm) {
                    switch (status) {
                        case 0:
                            this.emit(':ask', `Ok.`);
                        break;
                        default:
                            this.emit(':tell', 'Failed to complete request');
                    }
                
                }.bind(this));
        }
    },
    'Close': function () {
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        command(session.user.userId, "", appName, session.sessionId, name.toLowerCase(), 
            appName, function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        this.emit(':tell', `Closed`);
                    break;
                    case 1:
                        this.emit(':ask', `I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        this.emit(':tell', 'Failed to close app');
                }
            
            }.bind(this)); 
    },
    'Identify': function() {
        if (!checkConnection(this)) return;
        const {request, session} = this.event;
        const name = request.intent.name;
        const user = request.intent.slots.User.value;
        console.log(`${user}`);
        if (!user) {
            var slotToElicit = 'User';
            
            var speechOutput = 'I don\'t recognize that.';
            var repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        }
        else {
        command(session.user.userId, "", appName, session.sessionId, name.toLowerCase(), 
                user.toLowerCase(), function(status, sessionId, response, parm) {
                    switch(status) {
                        case 0:
                            this.emit(':ask', `User identity confirmed. Repeat your original request`);
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

module.exports = {presentations_app_id, presentations_handlers, presentations_strings};