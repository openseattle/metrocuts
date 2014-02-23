$(function() {
    var map = L.map('map', {
        center: [47.6210, -122.3328],
        zoom: 12
    });

    var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/domoritz.h6ibh733/{z}/{x}/{y}.png', {
      attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    
    var popup;

    var delayHeatmap = L.TileLayer.heatMap({
        radius: { value: 10, absolute: false },
        opacity: 1.0,
        gradient: {
          0.0: "rgba(255,0,0,0.5)",
          1.0: "rgb(255,0,0)"
        }
    });
    var betterHeatmap = L.TileLayer.heatMap({
        radius: { value: 10, absolute: false },
        opacity: 1.0,
        gradient: {
          0.0: "rgba(0,255,0,0.5)",
          1.0: "rgb(0,255,0)"
        }
    });
    var blackmap = L.TileLayer.heatMap({
        radius: { value: 10, absolute: false },
        opacity: 0.4,
        gradient: {
          0.0: "rgb(0,0,0)",
          1.0: "rgb(0,0,0)"
        }
    });

    $.getJSON('data/heatmap.json', function(data) {
        var max = 5;
        var min = -2;

        var dheatmapData = [];
        var gheatmapData = [];
        var bdata = [];
        $.each(data, function(ind, pt) {
          // pt.value = pt.delta;
          var stop = {};
          
          stop.lat = pt.lat;
          stop.lon = pt.lon;
//          var delta = 1 + (pt.proposed - pt.current) / pt.current;
//          stop.value = (delta - min)/(max - min);
          stop.value = pt.delta || 0;

          if (pt.delta ===null) {
            stop.value = 1;
            bdata.push(stop);
          } else if (stop.value > 0) {
            dheatmapData.push(stop);            
          } else {
            stop.value = -1 * stop.value;
            gheatmapData.push(stop);                        
          }
        });
        betterHeatmap.setData(gheatmapData);
        betterHeatmap.addTo(map);
        blackmap.setData(bdata);
        blackmap.addTo(map);
        delayHeatmap.setData(dheatmapData);
        delayHeatmap.addTo(map);
    });

    var hash = new L.Hash(map);
});