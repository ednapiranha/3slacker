'use strict';

const RtmClient = require('@slack/client').RtmClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const nconf = require('nconf');

const weather = require('./weather');
const reactions = require('./reactions');

nconf.argv().env().file({ file: 'config.json' });

const rtm = new RtmClient(nconf.get('slackKey'));

let uid;
let username;
let sockets;
let socket;
let messageHistory = {};

// This checks what kind of response to send depending on the regex we want to look for.
function sendResponse(data) {
  /*
  if (data.text.match(/^butt(\s|$)/gi)) {
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
  */

  // Let's return a weather status for a particular zip code in the United States.
  if (data.text.match(/3slacker/gi) || data.text.indexOf('@' + uid) > -1) {
    if (data.text.match(/weather [0-9]+$/i)) {
      weather.getWeather(data, rtm, sockets);
      return;
    }

    if (data.text.match(/what do you think/gi)) {
      sockets.emit('action', 'happy');
      sockets.emit('message', "CALL THE COPS I DON'T GIVE A FUCK");
      return;
    }
  }

  if (data.text.match(/balloon$/gi)) {
    sockets.emit('action', 'balloon');
    return;
  }

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
