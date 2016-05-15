'use strict';

require('../css/main.css');

const face = require('./face');
const ws = require('./ws');

const socket = ws.getSocket();

const wrapper = document.querySelector('#wrapper');
const weather = document.querySelector('.weather');

const msg = document.querySelector('.message');

let activeMsg;

// Initialize and render the 3D parts.
face.generate();

socket.on('connect', () => {
  socket.emit('join');
});

// Incoming messages are appended into the page.
socket.on('message', (data) => {
  clearTimeout(activeMsg);
  let p = msg.querySelector('p');
  p.textContent = data;
  msg.classList.add('on');
  activeMsg = function () {
    setTimeout(() => {
      msg.classList.remove('on');
    }, 8000);
  };
});

// Incoming weather statuses are matched by their respective images located in build/weather/.
socket.on('weather', (data) => {
  weather.classList.remove('on');

  setTimeout(() => {
    weather.src = '/weather/' + data + '.png';
    weather.classList.add('on');
  }, 1000);
});

socket.on('action', (data) => {
  switch (data) {
    case 'balloon':
      face.startBallooning();
      break;
    case 'happy':
      face.setFace('happy');
      break;
    case 'sad':
      face.setFace('sad');
      break;
    case 'tongue':
      face.setFace('tongue');
      break;
    case 'wink':
      face.setFace('wink');
      break;
    default:
      face.setFace('default');
      break;
  }
});
