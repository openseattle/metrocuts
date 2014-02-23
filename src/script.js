


$(function() {

	var dheatmapData = [];
    var gheatmapData = [];
    var bdata = [];

    // maxDistance: km
	function nearestStopFromLatLon(lat, lon) {
		var minDistance = 10000;
		var result;

		$.each(dheatmapData, function(ind, pt) {
			var distance = getLatLonDistanceInKm(lat, lon, pt.lat, pt.lon)
			if (distance <= minDistance) {
				result = pt;
				minDistance = distance;
			}
		});

		$.each(gheatmapData, function(ind, pt) {
			var distance = getLatLonDistanceInKm(lat, lon, pt.lat, pt.lon)
			if (distance <= minDistance) {
				result = pt;
				minDistance = distance;
			}
		});

		$.each(bdata, function(ind, pt) {
			var distance = getLatLonDistanceInKm(lat, lon, pt.lat, pt.lon)
			if (distance <= minDistance) {
				result = pt;
				minDistance = distance;
			}
		});

		console.log(result);
		return result;
	}


	// attr: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
	function getLatLonDistanceInKm(lat1, lon1, lat2, lon2) {
		  var R = 6371; // Radius of the earth in km
		  var dLat = deg2rad(lat2-lat1);  // deg2rad below
		  var dLon = deg2rad(lon2-lon1); 
		  var a = 
		    Math.sin(dLat/2) * Math.sin(dLat/2) +
		    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
		    Math.sin(dLon/2) * Math.sin(dLon/2)
		    ; 
		  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  var d = R * c; // Distance in km
		  return d;
	}

	// attr: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
	function deg2rad(deg) {
		return deg * (Math.PI/180)
	}

    var map = L.map('map', {
        center: [47.6210, -122.3328],
        zoom: 12
    });

    var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/domoritz.h6ibh733/{z}/{x}/{y}.png', {
      attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    
    var popup;

    map.on('click', function(e) {
      if (!popup) {
        popup = L.popup()
      }
      

      var nearestStop = nearestStopFromLatLon(e.latlng.lat, e.latlng.lng);
      e.latlng.lat = nearestStop.lat;
      e.latlng.lng = nearestStop.lon;
      popup.setLatLng(e.latlng);

      popup.setContent("<b>Current Routes:</b> " + (nearestStop.current_routes.length ? nearestStop.current_routes.join(", ") : "&mdash;") + "<br><b>Proposed Routes:</b> " + (nearestStop.proposed_routes.length ? nearestStop.proposed_routes.join(", ") : "&mdash;")).openOn(map);
    });

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

        $.each(data, function(ind, pt) {
          // pt.value = pt.delta;
          var stop = {};
          
          stop.lat = pt.lat;
          stop.lon = pt.lon;
//          var delta = 1 + (pt.proposed - pt.current) / pt.current;
//          stop.value = (delta - min)/(max - min);
          stop.value = pt.delta || 0;
          stop.current_routes = pt.current_routes;
          stop.proposed_routes = pt.proposed_routes;

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
