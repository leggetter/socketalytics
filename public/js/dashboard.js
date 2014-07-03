$( function() {
  localStorage.debug = 'socket.io-client:socket';

  var touch = $( '#touch_support' ).epoch( { type: 'time.gauge' } );
  var video = $( '#video_support' ).epoch( { type: 'time.gauge' } );
  var pages = $( '#pages' ).epoch( { type: 'bar' } );
  var visitors = $('#visitors').epoch( {
    type: 'time.area',
    data: [ { values: [ { time: Date.now()/1000, y: 0 } ] } ],
    axes: ['left', 'bottom', 'right']
  } );

  var dashboard = io( 'localhost:3000/dashboard' );
  dashboard.on( 'stats-updated', function( update ) {

    touch.update( update.touch );
    video.update( update.video );

    var pagesData = [];
    for( var url in update.pages ) {
      pagesData.push( { x: url, y: update.pages[ url ] } );
    }
    console.log( pagesData );
    pages.update( [ { label: 'Popular Pages', values: pagesData } ] );

    visitors.push( [ { time: Date.now()/1000, y: update.connections } ] );

  } );

} );
