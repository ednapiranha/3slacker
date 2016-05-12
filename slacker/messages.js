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
let messageHistory = {};

// This checks what kind of response to send depending on the regex we want to look for.
function sendResponse(data) {
  // Let's return a response back to the client if someone in the same channel as the bot says "lol" or
  // "looool" or "LOOOOOOOOOOL" or any variant of that, or haha or hehe or HAHAHA or HEHEHEHE, etc.
  if (data.text.match(/(lo{1,}l|haha|hehe)/gi)) {
    sockets.emit('message', 'HAHAHAHAHHAHAHAHAHAHAHA!');
    return;
  }

  if (data.text.match(/butt/gi)) {
    let butt = '( ＾◡＾)っ (‿|‿)';
    sockets.emit('message', butt);
    rtm.sendMessage(butt, data.channel);
    return;
  }

  if (data.text.match(/(cat|kitty|kitten)(\W|\s|$)/gi)) {
    let cat = ':neko-tubbs: :neko-tubbs: :neko-tubbs: ';
    sockets.emit('message', cat);
    rtm.sendMessage(cat, data.channel);
    return;
  }

  // Let's return a weather status for a particular zip code in the United States.
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

exports.init = function (socket) {
  sockets = socket;
  rtm.start();
};

rtm.on(RTM_CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
  uid = data.self.id;
  username = data.self.name;
  console.log('connected');
});

rtm.on(RTM_EVENTS.MESSAGE, (data) => {
  console.log(messageHistory)
  if (!messageHistory[data.ts]) {
    messageHistory[data.ts] = data;
    if (data.type === 'message') {
      checkMessageType(data);
    }
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
