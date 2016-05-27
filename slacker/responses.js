'use strict';

const nconf = require('nconf');
const Twitter = require('twitter');

const weather = require('./weather');

nconf.argv().env().file({ file: 'config.json' });

const client = new Twitter({
  consumer_key: nconf.get('twitterConsumerKey'),
  consumer_secret: nconf.get('twitterConsumerSecret'),
  access_token_key: nconf.get('twitterAccessToken'),
  access_token_secret: nconf.get('twitterAccessSecret')
});

exports.matchResponse = function (data, sockets, rtm, haiku) {
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

  if (data.text.match(/shots fired/ig)) {
    let message = "BLAOOOW!";
    sockets.emit('action', 'surprise');
    sockets.emit('message', message);
    rtm.sendMessage(message, data.channel);
    return;
  }

  if (data.text.match(/balloon$/gi)) {
    sockets.emit('action', 'balloon');
    return;
  }

  if (data.text.match(/haiku/gi)) {
    let haikuMsg = haiku.generate().join('\n');
    sockets.emit('action', 'surprise');
    sockets.emit('message', haikuMsg)
    client.post('statuses/update', {
      status: haikuMsg
    }, (err) => {
      if (err) {
        console.log(err);
      }
    });

    rtm.sendMessage(haikuMsg, data.channel);
    return;
  }
};
