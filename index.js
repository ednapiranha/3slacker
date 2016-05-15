/* eslint-env node */

'use strict';

const Hapi = require('hapi');
const SocketIO = require('socket.io');
const Inert = require('inert');
const Blankie = require('blankie');
const Scooter = require('scooter');
const nconf = require('nconf');

nconf.argv().env().file({ file: 'config.json' });

const slacker = require('./slacker/messages');

const server = new Hapi.Server();

let io;

server.connection({
  host: nconf.get('domain'),
  port: nconf.get('port')
});

server.register([
  {
    register: Inert
  },
  {
    register: require('vision')
  }
], (err) => {
  if (err) {
    console.log(err);
  }

  server.views({
    engines: {
      pug: require('pug')
    },
    isCached: process.env.node === 'production',
    path: __dirname + '/views',
    compileOptions: {
      pretty: true
    }
  });
});

server.register([Scooter,
  {
    register: Blankie,
    options: {
      defaultSrc: 'self',
      connectSrc: ['ws:', 'wss:', 'self'],
      imgSrc: ['self', 'data:', 'http://www.google-analytics.com',
               'https://www.google-analytics.com'],
      scriptSrc: ['self', 'http://www.google-analytics.com',
                  'https://www.google-analytics.com',
                  'http://s.ytimg.com', 'https://s.ytimg.com'],
      styleSrc: ['self', 'unsafe-inline', 'https://brick.a.ssl.fastly.net',
                 'http://brick.a.ssl.fastly.net'],
      fontSrc: ['self', 'https://brick.a.ssl.fastly.net',
                'http://brick.a.ssl.fastly.net'],
      generateNonces: false
    }
  }
], (err) => {
  if (err) {
    throw err;
  }
});

let home = function (request, reply) {
  reply.view('index', {
    analytics: nconf.get('analytics')
  });
};

const routes = [
  {
    method: 'GET',
    path: '/',
    config: {
      handler: home
    }
  }
];

server.route(routes);

server.route({
  path: '/{p*}',
  method: 'GET',
  handler: {
    directory: {
      path: './build',
      listing: false,
      index: false
    }
  }
});

server.start(function (err) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }

  io = SocketIO.listen(server.listener);

  io.on('connection', (socket) => {
    slacker.init(io);

    socket.on('join', (data) => {
      console.log('joined');
      socket.emit('message', 'attempting to connect ...');
    });
  });
});
