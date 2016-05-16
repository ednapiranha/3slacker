'use strict';

const RtmClient = require('@slack/client').RtmClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const nconf = require('nconf');

const reactions = require('./reactions');
const responses = require('./responses');

nconf.argv().env().file({ file: 'config.json' });

const rtm = new RtmClient(nconf.get('slackKey'));

let uid;
let username;
let sockets;
let socket;
let messageHistory = {};

function sendResponse(data) {
  responses.matchResponse(data, sockets, rtm);
  reactions.setType(data, sockets);
}

exports.init = function (io, sck) {
  sockets = io.sockets;
  socket = sck;
  rtm.start();
};

rtm.on(RTM_CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
  uid = data.self.id;
  username = data.self.name;
  socket.emit('message', 'i am connected to slack.');
  console.log('connected');
});

rtm.on(RTM_EVENTS.MESSAGE, (data) => {
  if (!messageHistory[data.ts]) {
    messageHistory[data.ts] = data;
    if (data.type === 'message' && data.text) {
      sendResponse(data);
    }

    setTimeout(() => {
      delete messageHistory[data.ts];
    }, 15000);
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
