'use strict';

const io = require('socket.io-client');

let socket = io(null, {
  'forceNew': true,
  'reconnect': true,
  'reconnection delay': 1000,
  'max reconnection attempts': 10
});

exports.getSocket = function () {
  return socket;
};

socket.on('disconnect', () => {
  console.log('disconnected!');
});
