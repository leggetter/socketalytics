var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  console.log( 'connection' );
  socket.on( 'client-data', function( data ) {
    console.log( data );
  } );
  socket.on('mousemove', function(msg){
    // console.log( msg );
    io.emit('mousemove', msg);
  });

  console.log( 'clients', io.sockets.server.engine.clientsCount );
  // console.log( io.sockets.manager.server.connections );
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
