$(document).ready(function() {
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var directionsService = new google.maps.DirectionsService;
  var map; 
  var infowindow = new google.maps.InfoWindow(); 
  var marker;

  //AUTOCOMPLETE ADDRESS FOR FORM & RENDERS MAP ON INITIAL LOAD
  google.maps.event.addDomListener(window, 'load', initialize);
  google.maps.event.addDomListener(window, 'load', initMap);


// MIDWAY POINT
// google.maps.geometry.spherical.interpolate(xPlace, yPlace, 0.5);


  //GIVES LAT AND LONG OF GIVEN ADDRESSES 
  function searchAddress() {
    var start = document.getElementById('start').value;
    var endloc = document.getElementById('endloc').value;
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({address: start}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      var mySResultLat = results[0].geometry.location.lat(); 
      var mySResultLng = results[0].geometry.location.lng(); 
        console.log(mySResultLat)
        console.log(mySResultLng)
    }
    });

    geocoder.geocode({address: endloc}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      var myEResultLat = results[0].geometry.location.lat();
      var myEResultLng = results[0].geometry.location.lng();
        console.log(myEResultLat)
        console.log(myEResultLng)
    }
    });

    function midpoint(lat1, long1, lat2, long2, 0.5) {
     console.log([lat1+(lat2-lat1)*0.5, long1+(long2-long1)*0.5])
    }
  }

  //SHOWS INFOWINDOW 
  function bindInfoWindow(marker, map, infowindow, content) {
	marker.addListener('click', function(){
    infowindow.setContent(content);  
    infowindow.open(map, this);       		
	}); 
	} 

  //AUTOCOMPLETE ADDRESS
  function initialize() {
    var input = document.getElementById('start');
    var autocomplete = new google.maps.places.Autocomplete(input);

    var input2 = document.getElementById('endloc');
    var autocomplete2 = new google.maps.places.Autocomplete(input2);
  }

  //SHOWS INITIAL MAP (no directions)
  function initMap() {
    var mySLatLng = new google.maps.LatLng(40.712950, -73.957758);
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: mySLatLng
    });
    directionsDisplay.setMap(map);

    var request = {
    	location: mySLatLng,
    	radius: '500',
    	types: ['restaurant']
    };

	  var service = new google.maps.places.PlacesService(map);
	  service.nearbySearch(request, function(results, status) {
	    if (status == google.maps.places.PlacesServiceStatus.OK) {
	      for (var i = 0; i < results.length; i++) {
	        var place = results[i];
	        var marker = new google.maps.Marker({
	          map: map,
	          position: place.geometry.location
	        });
 
       		var content = '<strong>' + place.name + '</strong><br>' 
		        + '$$$ = ' + place.price_level + '<br>' 
		        // + 'Place ID: ' + place.place_id + '<br>' // Test tag, unnecessary for users
		        + 'Address: ' + place.vicinity + '<br>'  //using "place.formatted_address" would come up as undefined
		        // + 'Ph: ' + place.formatted_phone_number + '<br>' //also undefined 
		        + 'Rating: ' + place.rating + ' out of 5 stars' + '<br>'  
		        + 'Coordinates: ' + place.geometry.location + '<br>'
        		+ 'Is it open now? ' + place.opening_hours.open_now + '<br>'
        
          bindInfoWindow(marker, map, infowindow, content) 
	      }
	    }
	  });

  //MODE OF TRANSPORT REFLECTED ON CHANGE INSTEAD OF HAVING TO PRESS REFRESH
    calculateAndDisplayRoute(directionsService, directionsDisplay);
    document.getElementById('mode').addEventListener('change', function() {
      calculateAndDisplayRoute(directionsService, directionsDisplay);
    });
  }

  //TAKES START AND END LOCATIONS AND RENDERS DIRECTION ON MAP
  function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    var input = document.getElementById('start').value

    var input2 = document.getElementById('endloc').value

    var selectedMode = document.getElementById('mode').value;
    directionsService.route({
      origin: input,
      destination: input2, 
      travelMode: google.maps.TravelMode[selectedMode] //travel mode from drop down
    }, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  $('#submit_button').click(function(){
    calculateAndDisplayRoute(directionsService, directionsDisplay);
    searchAddress()
    });
});

