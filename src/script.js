$(function() {
    var map = L.map('map', {
        center: [47.6210, -122.3328],
        zoom: 10
    });

    var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/domoritz.h6ibh733/{z}/{x}/{y}.png', {
      attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    
    var popup;
    
    map.on('click', function(e) {
      if (!popup) {
        popup = L.popup()
      }
      popup.setLatLng(e.latlng);
      popup.setContent("hi!" + e.latlng).openOn(map);
    }); 

    var delayHeatmap = L.TileLayer.heatMap({
        radius: { value: 100, absolute: true },
        opacity: 1.0,
        gradient: {
          0.0: "rgba(255,0,0,0.5)",
          1.0: "rgb(255,0,0)"
        }
    });
    var betterHeatmap = L.TileLayer.heatMap({
        radius: { value: 100, absolute: true },
        opacity: 1.0,
        gradient: {
          0.0: "rgba(0,255,0,0.5)",
          1.0: "rgb(0,255,0)"
        }
    });

    $.getJSON('data/stops_data.json', function(data) {
        var max = 2;
        var min = -1;

        var dheatmapData = [];
        var gheatmapData = [];
        $.each(data, function(ind, pt) {
          // pt.value = pt.delta;
          
          var stop = {};
          stop.lat = pt.Lat;
          stop.lon = pt.Long;
//          var delta = 1 + (pt.proposed - pt.current) / pt.current;
//          stop.value = (delta - min)/(max - min);
          stop.value = 2 * Math.random() - 1;
          
          if (stop.value > 0) {
            dheatmapData.push(stop);            
          } else {
            stop.value = -1 * stop.value;
            gheatmapData.push(stop);                        
          }
        });
        betterHeatmap.setData(gheatmapData);
        betterHeatmap.addTo(map);
        delayHeatmap.setData(dheatmapData);
        delayHeatmap.addTo(map);
    });

    var hash = new L.Hash(map);
});