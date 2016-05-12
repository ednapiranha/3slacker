'use strict';

require('../css/main.css');

const moment = require('moment');

const face = require('./face');
const ws = require('./ws');

const socket = ws.getSocket();

const wrapper = document.querySelector('#wrapper');
const div = document.querySelector('.message');

function setTime() {
  return moment().format('LTS');
}

face.generate();

socket.on('connect', () => {
  socket.emit('join');
});

socket.on('message', (data) => {
  face.setText(data, setTime());
});
