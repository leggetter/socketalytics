var express = require( 'express' );
var app = express();
app.use( express.static( __dirname + '/public') );

var server = require( 'http' ).Server( app );
var io = require( 'socket.io' )( server );

var globalStats = {
  connections: 0,
  touch: 0,
  video: 0,
  webgl: 0,
  websocket: 0
};

var captureSockets = {};
var capture = io.of( '/capture' );
var dashboard = io.of( '/dashboard' );

capture.on( 'connection', function( socket ) {
  captureSockets[ socket.id ] = { socket: socket, stats: {} };

  ++globalStats.connections;

  socket.on( 'disconnect', function() {
    --globalStats.connections;

    var data = captureSockets[ socket.id ].stats;
    globalStats.touch     -= ( data.touch?     1 : 0 );
    globalStats.video     -= ( data.video?     1 : 0 );
    globalStats.webgl     -= ( data.webgl?     1 : 0 );
    globalStats.websocket -= ( data.websocket? 1 : 0 );
    delete captureSockets[ socket.id ];

    console.log( globalStats );
    sendUpdate();
  } );

  socket.on( 'client-data', function( data ) {
    captureSockets[ socket.id ].stats = data;
    globalStats.touch     += ( data.touch?     1 : 0 );
    globalStats.video     += ( data.video?     1 : 0 );
    globalStats.webgl     += ( data.webgl?     1 : 0 );
    globalStats.websocket += ( data.websocket? 1 : 0 );

    console.log( globalStats );
    sendUpdate();
  } );
} );

function percent( stat ) {
  return Math.round( stat / globalStats.connections ) * 100;
}

function sendUpdate() {
  var update = {
    touchPercent: percent( globalStats.touch ),
    videoPercent: percent( globalStats.video ),
    webglPercent: percent( globalStats.webgl ),
    websocketPercent: percent( globalStats.websocket )
  };
  console.log( update );
  dashboard.emit( 'stats-updated', update );
}

server.listen( 3000, function(){
  console.log( 'listening on *:3000' );
} );
