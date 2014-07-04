$( function() {
  localStorage.debug = 'socket.io-client:socket';

  var visitors = $('#visitors').epoch( {
    type: 'time.area', axes: ['left', 'bottom', 'right'],
    data: [ { values: [ { time: Date.now()/1000, y: 0 } ] } ]
  } );
  var pages = $( '#pages' ).epoch( { type: 'bar' } );
  var touch = $( '#touch' ).epoch( { type: 'time.gauge' } );
  var video = $( '#video' ).epoch( { type: 'time.gauge' } );

  var dashboard = io( 'localhost:3000/dashboard' );
  dashboard.on( 'stats-updated', function( update ) {

    // Convert to percentages
    touch.update( ( update.touch / update.connections ) || 0 );
    video.update( ( update.video / update.connections ) || 0 );

    var pagesData = [];
    for( var url in update.pages ) {
      pagesData.push( { x: url, y: update.pages[ url ] } );
    }
    pages.update( [ { values: pagesData } ] );

    visitors.push( [ { time: Date.now()/1000, y: update.connections } ] );

  } );

} );
