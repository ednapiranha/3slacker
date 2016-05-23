'use strict';

exports.setType = function (data, sockets) {
  // happy
  if (data.text.match(/(lo{1,}l|haha|hehe|:\){1,}|:D{1,}|:smile:|:slightly_smiling_face:|ya{1,}y|wo{1,})(\W|$)/gi)) {
    sockets.emit('action', 'happy');
    sockets.emit('message', ':) :) :)');
    return;
  }

  // sad
  if (data.text.match(/(:\({1,}|D:|:\\{1,}|boo{1,}|:anguished:)(\W|$)/gi)) {
    sockets.emit('action', 'sad');
    sockets.emit('message', 'ugh :(');
    return;
  }

  // surprise
  if (data.text.match(/(:open_mouth:|:o)(\W|$)/gi)) {
    sockets.emit('action', 'surprise');
    sockets.emit('message', ':o');
    return;
  }
};
