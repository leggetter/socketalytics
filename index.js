var express = require( 'express' );
var app = express();
app.use( express.static( __dirname + '/public') );

var server = require( 'http' ).Server( app );
var io = require( 'socket.io' )( server );

var globalStats = {
  connections: 0,
  touch: 0,
  video: 0,
  pages: {}
};

var captureSockets = {};
var capture = io.of( '/capture' )

capture.on( 'connection', function( socket ) {
  captureSockets[ socket.id ] = { socket: socket, stats: {} };

  ++globalStats.connections;

  socket.on( 'disconnect', function() {
    --globalStats.connections;

    var data = captureSockets[ socket.id ].stats;
    globalStats.touch -= ( data.touch? 1 : 0 );
    globalStats.video -= ( data.video? 1 : 0 );
    --globalStats.pages[ data.url ];
    delete captureSockets[ socket.id ];

    console.log( globalStats );
    sendUpdate( dashboard );
  } );

  socket.on( 'client-data', function( data ) {
    captureSockets[ socket.id ].stats = data;
    globalStats.touch += ( data.touch? 1 : 0 );
    globalStats.video += ( data.video? 1 : 0 );

    var pageCount = globalStats.pages[ data.url ] || 0;
    globalStats.pages[ data.url ] = ++pageCount;

    console.log( globalStats );
    sendUpdate( dashboard );
  } );
} );

var dashboard = io.of( '/dashboard' );
dashboard.on( 'connection', function( socket ) {
  sendUpdate( socket );
} );

function sendUpdate( emitter ) {
  var update = {
    connections: globalStats.connections,
    touch: Math.round( globalStats.touch / globalStats.connections ) || 0,
    video: Math.round( globalStats.video / globalStats.connections ) || 0,
    pages: globalStats.pages
  };

  console.log( update );
  emitter.emit( 'stats-updated', update );
}

server.listen( 3000, function(){
  console.log( 'listening on *:3000' );
} );
