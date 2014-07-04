var express = require( 'express' );
var app = express();
app.use( express.static( __dirname + '/public') );

var server = require( 'http' ).Server( app );
var io = require( 'socket.io' )( server );

// Store data
var stats = {
  connections: 0,
  touch: 0,
  video: 0,
  pages: {}
};

// Map of Socket.id to Socket object
var socketData = {};

// Namespace use when capturing data
var capture = io.of( '/capture' );

capture.on( 'connection', function( socket ) {
  ++stats.connections;

  socket.on( 'client-data', function( data ) {
    socketData[ socket.id ] = data;
    stats.touch += ( data.touch? 1 : 0 );
    stats.video += ( data.video? 1 : 0 );

    var pageCount = stats.pages[ data.url ] || 0;
    stats.pages[ data.url ] = ++pageCount;

    console.log( stats );
    dashboard.emit( 'stats-updated', stats );
  } );

  socket.on( 'disconnect', function() {
    // Clear down stats for lost socket
    --stats.connections;

    stats.touch -= ( socketData[ socket.id ].touch? 1 : 0 );
    stats.video -= ( socketData[ socket.id ].video? 1 : 0 );
    --stats.pages[ socketData[ socket.id ].url ];
    delete socketData[ socket.id ];

    console.log( stats );
    dashboard.emit( 'stats-updated', stats );
  } );

} );

var dashboard = io.of( '/dashboard' );
dashboard.on( 'connection', function( socket ) {
  // Send an update to the newly connected dashboard socket
  socket.emit( 'stats-updated', stats );
} );

server.listen( 3000, function(){
  console.log( 'listening on *:3000' );
} );
