'use strict';

const RtmClient = require('@slack/client').RtmClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const nconf = require('nconf');
const request = require('request');

nconf.argv().env().file({ file: 'config.json' });

const rtm = new RtmClient(nconf.get('slackKey'));

let uid;
let username;
let sockets;

function setWeather(id) {
  switch (id) {
    case 800:
      sockets.emit('weather', 'clear');
      break;
    default:
      break;
  }
}

function sendResponse(data) {
  if (data.text.match(/(lo{1,}l|haha|hehe)/gi)) {
    rtm.sendMessage('lol!', data.channel);
    return;
  }

  if (data.text.match(/3slacker/gi) || data.text.indexOf('@' + uid) > -1) {
    if (data.text.match(/weather [0-9]+$/i)) {
      let zip = data.text.split('weather ')[1];
      request('http://api.openweathermap.org/data/2.5/weather?zip=' + zip + ',us' +
              '&APPID=' + nconf.get('openWeatherKey'), (err, response, body) => {
        if (!err && response.statusCode === 200) {
          let weather = JSON.parse(body).weather[0];
          setWeather(weather.id);
          rtm.sendMessage('Weather for ' + zip + ' is ' + weather.main, data.channel);
        } else {
          rtm.sendMessage('Error retrieving weather report', data.channel);
        }
      });
    } else if (data.text.match(/thanks/gi)) {
      rtm.sendMessage("You're welcome :D", data.channel);
    } else if (data.text.match(/you’re weird/gi)) {
      rtm.sendMessage('I am the walrus', data.channel);
    }
  }
}

function checkMessageType(data) {
  console.log(data)
  if (data.subtype) {
    switch (data.subtype) {
      case 'channel_join':
        sockets.emit('message', "Hi, I'm just saying hi that's all. Ok.");
        rtm.sendMessage("Hi, I'm just saying hi that's all. Ok.", data.channel);
        break;

      default:
        break;
    }

    return;
  }

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
