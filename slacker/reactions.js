'use strict';

exports.setType = function (data, sockets) {
  console.log('got here')
  // happy
  if (data.text.match(/(lo{1,}l|haha|hehe|:\){1,}|:D{1,}|:smile:|:slightly_smiling_face:)(\W|$)/gi)) {
    sockets.emit('action', 'happy');
    sockets.emit('message', 'haha :)');
    return;
  }

  // sad
  if (data.text.match(/(:\({1,}|D:|:\\{1,}|boo{1,}|:anguished:)(\W|$)/gi)) {
    sockets.emit('action', 'sad');
    sockets.emit('message', 'ugh :(');
    return;
  }

  // tongue
  if (data.text.match(/(:stuck_out_tongue:|:stuck_out_tongue_winking_eye:)(\W|$)/gi)) {
    sockets.emit('action', 'tongue');
    sockets.emit('message', ':P');
    return;
  }

  // wink
  if (data.text.match(/(:wink:|;D{1,})(\W|$)/gi)) {
    sockets.emit('action', 'wink');
    sockets.emit('message', ';)');
    return;
  }

  sockets.emit('action', 'default');
};
