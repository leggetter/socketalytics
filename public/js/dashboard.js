/*
 * Class for generating real-time data for the area, line, and bar plots.
 */
var RealTimeData = function(layers) {
    this.layers = layers;
    this.timestamp = ((new Date()).getTime() / 1000)|0;
};

RealTimeData.prototype.rand = function() {
    return parseInt(Math.random() * 100) + 50;
};

RealTimeData.prototype.history = function(entries) {
    if (typeof(entries) != 'number' || !entries) {
        entries = 60;
    }

    var history = [];
    for (var k = 0; k < this.layers; k++) {
        history.push({ values: [] });
    }

    for (var i = 0; i < entries; i++) {
        for (var j = 0; j < this.layers; j++) {
            history[j].values.push({time: this.timestamp, y: this.rand()});
        }
        this.timestamp++;
    }

    return history;
};

RealTimeData.prototype.next = function() {
    var entry = [];
    for (var i = 0; i < this.layers; i++) {
        entry.push({ time: this.timestamp, y: this.rand() });
    }
    this.timestamp++;
    return entry;
};

/*
 * Gauge Data Generator.
 */
var GaugeData = function() {};

GaugeData.prototype.next = function() {
    return Math.random();
};

function GuageWidget( elId, namespace, options ) {
  this.chart = $( elId ).epoch( {
    type: 'time.gauge',
    value: options.value
  } );

  this.ns = io( namespace );
  this.ns.on( 'current-data', this.update.bind( this ) );
  this.ns.on( 'new-data', this.update.bind( this ) );

  this.startUpdates();
}

GuageWidget.prototype.update = function( data ) {
  this.chart.update( data.value );
};

GuageWidget.prototype.startUpdates = function() {
  var self = this;
  setInterval( function() {
    self.update( { value: Math.random() } );
  }, 2000 );
};

function createGuageWidgets() {
  new GuageWidget( '#webgl_support', '/webgl', { value: 0 } );
  new GuageWidget( '#touch_support', '/touch', { value: 0 } );
  new GuageWidget( '#ws_support', '/websocket', { value: 0 } );
  new GuageWidget( '#video_support', '/video', { value: 0 } );
}

$(function() {
    var data = new RealTimeData( 4 );

    var chart = $('#visitors').epoch({
        type: 'time.area',
        data: data.history(),
        axes: ['left', 'bottom', 'right']
    });

    setInterval(function() { chart.push(data.next()); }, 2000);
    chart.push(data.next());
});



$( function() {
  var barChartData = [
    // First bar series
    {
      label: 'Series 1',
      values: [
        { x: '/', y: 30 },
        { x: '/other-page/', y: 10 },
        { x: '/yet-another-page', y: 12 }
      ]
    }
  ];

  var pagesChart = $( '#pages' ).epoch({
    type: 'bar',
    data: barChartData
  });

  setInterval( function() {
    barChartData[ 0 ].values[ 0 ].y = Math.round( Math.random() * 100 );
    pagesChart.update( barChartData );
  }, 3000 );
} );

$( function() {
  localStorage.debug = 'socket.io-client:socket';

  createGuageWidgets();

  // var socket = io( '/dashboard' );
  // socket.on( 'client-data', function( clientData ) {
  //   alert( clientData );
  // } );
} );
