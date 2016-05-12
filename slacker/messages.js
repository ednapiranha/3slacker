'use strict';

const RtmClient = require('@slack/client').RtmClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const nconf = require('nconf');

const weather = require('./weather');

nconf.argv().env().file({ file: 'config.json' });

const rtm = new RtmClient(nconf.get('slackKey'));

let uid;
let username;
let sockets;

function sendResponse(data) {
  if (data.text.match(/(lo{1,}l|haha|hehe)/gi)) {
    rtm.sendMessage('lol!', data.channel);
    return;
  }

  if (data.text.match(/3slacker/gi) || data.text.indexOf('@' + uid) > -1) {
    if (data.text.match(/weather [0-9]+$/i)) {
      weather.getWeather(data, rtm, sockets);
    }
  }
}

function checkMessageType(data) {
  if (data.text) {
    sendResponse(data);
  }
}

exports.init = function (io) {
  sockets = io.sockets;
  rtm.start();
};

rtm.on(RTM_CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
  uid = data.self.id;
  username = data.self.name;
  console.log('connected');
});

rtm.on(RTM_EVENTS.MESSAGE, (data) => {
  switch (data.type) {
    case 'message':
      checkMessageType(data);
      break;

    default:
      break;
  }
});

rtm.on(RTM_EVENTS.REACTION_ADDED, (data) => {
  switch (data.type) {
    case 'reaction_added':
      console.log('noted reaction ', data.item.ts);
      break;

    default:
      break;
  }
});
