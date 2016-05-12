'use strict';

const nconf = require('nconf');
const request = require('request');

nconf.argv().env().file({ file: 'config.json' });

// Weather conditions taken from http://openweathermap.org/weather-conditions
function setWeather(id, sockets) {
  switch (id) {
    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
    case 511:
    case 520:
    case 521:
    case 522:
    case 531:
      sockets.emit('weather', 'rain');
      break;
    case 600:
    case 601:
    case 602:
    case 611:
    case 612:
    case 615:
    case 616:
    case 620:
    case 621:
    case 622:
      sockets.emit('weather', 'snow');
      break;
    case 801:
    case 802:
    case 803:
    case 804:
      sockets.emit('weather', 'clouds');
      break;
    case 800:
      sockets.emit('weather', 'clear');
      break;
    default:
      break;
  }
};

exports.getWeather = function (data, rtm, sockets) {
  let zip = data.text.split('weather ')[1];
  request('http://api.openweathermap.org/data/2.5/weather?zip=' + zip + ',us' +
          '&APPID=' + nconf.get('openWeatherKey'), (err, response, body) => {
    if (!err && response.statusCode === 200) {
      let weather = JSON.parse(body).weather[0];
      setWeather(weather.id, sockets);
      rtm.sendMessage('Weather for ' + zip + ' is ' + weather.main, data.channel);
    } else {
      rtm.sendMessage('Error retrieving weather report', data.channel);
    }
  });
};