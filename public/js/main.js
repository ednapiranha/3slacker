'use strict';

require('../css/main.css');

const face = require('./face');
const ws = require('./ws');

const socket = ws.getSocket();

const wrapper = document.querySelector('#wrapper');
const weather = document.querySelector('.weather');

face.generate();

socket.on('connect', () => {
  socket.emit('join');
});

socket.on('message', (data) => {
  let div = document.createElement('div');
  div.classList.add('message');
  let p = document.createElement('p');
  p.textContent = data;
  div.appendChild(p);
  div.classList.add('on');
  wrapper.appendChild(div);
});

socket.on('weather', (data) => {
  weather.classList.remove('on');

  setTimeout(() => {
    weather.src = '/weather/' + data + '.png';
    weather.classList.add('on');
  }, 1000);
});
