'use strict';

const RtmClient = require('@slack/client').RtmClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const nconf = require('nconf');
const Haiku = require('random-haiku');

const reactions = require('./reactions');
const responses = require('./responses');

nconf.argv().env().file({ file: 'config.json' });

const rtm = new RtmClient(nconf.get('slackKey'));

let uid;
let username;
let sockets;
let socket;
let messageHistory = {};
let haiku = new Haiku();

let sentence = 'appears doomed seems the it awful nerd alone runs walks smart dumb chair ' +
               'sings considered a we seems appears they always tired amused ' +
               'sadness joy shakes knows glitter blue green quickly superb she he ' +
               'them bike dog car rainbow ' +
               'briskly firmly swiftly really writing laughing eating dancing ' +
               'forever never happy sad sleeping curious bored cat person it is';

haiku.addToDataset(sentence);

function sendResponse(data) {
  responses.matchResponse(data, sockets, rtm, haiku);
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
      haiku.addToDataset(data.text);
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
