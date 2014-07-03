var express = require( 'express' );
var app = express();
app.use( express.static( __dirname + '/public') );

var server = require( 'http' ).Server( app );
var io = require( 'socket.io' )( server );

// Store data
var globalStats = {
  connections: 0,
  touch: 0,
  video: 0,
  pages: {}
};

// Map of Socket.id to Socket object
var captureSockets = {};

// Namespace use when capturing data
var capture = io.of( '/capture' );

capture.on( 'connection', function( socket ) {
  captureSockets[ socket.id ] = { socket: socket, stats: {} };

  ++globalStats.connections;

  socket.on( 'disconnect', function() {
    // Clear down stats for lost sockeet
    --globalStats.connections;

    var data = captureSockets[ socket.id ].stats;
    globalStats.touch -= ( data.touch? 1 : 0 );
    globalStats.video -= ( data.video? 1 : 0 );
    --globalStats.pages[ data.url ];
    delete captureSockets[ socket.id ];

    console.log( globalStats );
    dashboard.emit( 'stats-updated', globalStats );
  } );

  socket.on( 'client-data', function( data ) {
    captureSockets[ socket.id ].stats = data;
    globalStats.touch += ( data.touch? 1 : 0 );
    globalStats.video += ( data.video? 1 : 0 );

    var pageCount = globalStats.pages[ data.url ] || 0;
    globalStats.pages[ data.url ] = ++pageCount;

    console.log( globalStats );
    dashboard.emit( 'stats-updated', globalStats );
  } );
} );

var dashboard = io.of( '/dashboard' );
dashboard.on( 'connection', function( socket ) {
  // Send an update to the newly connected dashboard socket
  socket.emit( 'stats-updated', globalStats );
} );

server.listen( 3000, function(){
  console.log( 'listening on *:3000' );
} );
