'use strict';

const nconf = require('nconf');
const Twitter = require('twitter');
const request = require('request');
const qs = require('querystring');

const weather = require('./weather');

nconf.argv().env().file({ file: 'config.json' });

const client = new Twitter({
  consumer_key: nconf.get('twitterConsumerKey'),
  consumer_secret: nconf.get('twitterConsumerSecret'),
  access_token_key: nconf.get('twitterAccessToken'),
  access_token_secret: nconf.get('twitterAccessSecret')
});

exports.matchResponse = function (data, sockets, rtm, haiku, db, uid) {
  if (data.text.match(/^3slacker/gi) || data.text.indexOf('@' + uid) > -1) {
    if (data.text.match(/llkittens$/i)) {
      let msg = haiku.generate()[1];
      client.post('statuses/update', {
        status: '@llkittens ' + msg
      }, (err) => {
        if (err) {
          return console.log(err);
        }

        rtm.sendMessage('Sent the following to llkittens: "' + msg + '"', data.channel);
      });
    }
  }

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

  if (data.text.match(/domain: <\w{4,}:\/\/\w{1,}\.\w{2,}\|\w{1,}\.\w{2,}>$/i) ||
      data.text.match(/domain: \w{1,}\.\w{2,}$/i)) {
    let domain = data.text.split('domain: ')[1].split('|')[1].split('>')[0];

    let opts = {
      url: 'https://jsonwhois.com/api/v1/whois?' + qs.stringify({
        domain: domain
      }),
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Token token=' + nconf.get('jsonWhoisToken')
      }
    }

    request(opts, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        rtm.sendMessage('Could not get domain status', data.channel);
        return;
      }

      body = JSON.parse(body);

      let info = 'Domain: ' + body.domain + ' | Available: ' + body['available?'];

      rtm.sendMessage(info, data.channel);
    });
  }

  if (data.text.match(/\!del\s\w{1,3}\s\w+$/i)) {
    let command = data.text.split('!del ');
    let commands = command[1].split(' ');
    let category = commands[0];
    let word = commands[1];
    console.log(category, word)
    db.put('dataset', haiku.del(category, word));
  }

  if (data.text.match(/^haiku$/gi)) {
    let haikuMsg = haiku.generate().join('\n');
    sockets.emit('action', 'surprise');
    sockets.emit('message', haikuMsg);
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
