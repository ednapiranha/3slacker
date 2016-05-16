'use strict';

const weather = require('./weather');

exports.matchResponse = function (data, sockets, rtm) {
  if (data.text.match(/weather [0-9]+$/i)) {
    weather.getWeather(data, rtm, sockets);
    return;
  }

  if (data.text.match(/what do you think/gi)) {
    let message = "CALL THE COPS, I DON'T GIVE A FUCK";
    sockets.emit('action', 'happy');
    sockets.emit('message', message);
    rtm.sendMessage(message, data.channel);
    return;
  }

  if (data.text.match(/balloon$/gi)) {
    sockets.emit('action', 'balloon');
    return;
  }
};
