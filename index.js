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
  } );

  socket.on( 'client-data', function( data ) {
    captureSockets[ socket.id ].stats = data;
    globalStats.touch     += ( data.touch?     1 : 0 );
    globalStats.video     += ( data.video?     1 : 0 );
    globalStats.webgl     += ( data.webgl?     1 : 0 );
    globalStats.websocket += ( data.websocket? 1 : 0 );

    console.log( globalStats );
  } );
} );

server.listen( 3000, function(){
  console.log( 'listening on *:3000' );
} );
