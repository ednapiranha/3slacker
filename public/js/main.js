'use strict';

require('../css/main.css');

const moment = require('moment');

const face = require('./face');
const ws = require('./ws');

const socket = ws.getSocket();

const wrapper = document.querySelector('#wrapper');

function setTime() {
  return moment().format('LTS');
}

face.generate();

socket.on('connect', () => {
  socket.emit('join');
});

socket.on('message', (data) => {
  let div = document.createElement('div');
  div.classList.add('message');
  let p = document.createElement('p');
  p.textContent = data;
  let time = document.createElement('time');
  time.textContent = setTime();
  div.appendChild(time);
  div.appendChild(p);
  div.classList.add('on');
  wrapper.appendChild(div);
});

socket.on('weather', (data) => {
  let img = document.createElement('img');
  img.classList.add('weather');
  img.src = '/weather/' + data + '.png';
  wrapper.appendChild(img);
});
