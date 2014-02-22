$(function() {
    var map = L.map('map', {
        center: [47.6210, -122.3328],
        zoom: 13
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

    var heatmapLayer = L.TileLayer.heatMap({
        radius: { value: 100, absolute: true },
        opacity: 1.0,
        gradient: {
          0.0: "rgb(0,255,0)",
          0.45: "rgba(0,255,0, 1)",
          0.50: "rgba(255,255,0,1)",
          0.55: "rgb(255,255,0)",
          1.0: "rgb(255,0,0)"
        }
    });

    $.getJSON('data/heatmap.json', function(data) {
        var max = 2;
        var min = -1;

        var heatmapData = [];
        $.each(data, function(ind, pt) {
          // pt.value = pt.delta;
          
          var stop = {};
          stop.lat = pt.lat;
          stop.lon = pt.lon;
          var delta = 1 + (pt.proposed - pt.current) / pt.current;
          stop.value = (delta - min)/(max - min);
          
          console.log(stop);
          heatmapData.push(stop);
        });
        heatmapLayer.setData(heatmapData);
        heatmapLayer.addTo(map);
    });

    var hash = new L.Hash(map);
});