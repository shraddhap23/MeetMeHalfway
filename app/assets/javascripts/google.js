$(document).ready(function() {
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var directionsService = new google.maps.DirectionsService;
  var map; 
  var infowindow = new google.maps.InfoWindow(); 
  var marker;
  var polyline = null;

  //AUTOCOMPLETE ADDRESS FOR FORM ON INITIAL LOAD
  google.maps.event.addDomListener(window, 'load', initialize);


// MIDWAY POINT
// google.maps.geometry.spherical.interpolate(xPlace, yPlace, 0.5);
  function createMarker(latlng, label, html) {
    var contentString = '<b>' + label + '</b><br>' + html;
    var marker = new google.maps.Marker({
      position: latlng, 
      map: map,
      title: label,
      zIndex: Math.round(latlng.lat()*-100000)<<5
      });
      marker.myname = label;

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(contentString + '<br>' + marker.getPosition().toUrlValue(6));
      infowindow.open(map, marker);
    });
    return marker;
  }

  //AUTOCOMPLETE ADDRESS
  function initialize() {
    var input = document.getElementById('start');
    var autocomplete = new google.maps.places.Autocomplete(input);

    var input2 = document.getElementById('endloc');
    var autocomplete2 = new google.maps.places.Autocomplete(input2);
  } 

  // GIVES LAT AND LONG OF GIVEN ADDRESSES FROM AUTOCOMPLETE --> Thought I was going to need this to find the midpoint, turns out I didn't -____- 
  // function searchAddress() {
  //   var start = document.getElementById('start').value;
  //   var endloc = document.getElementById('endloc').value;
  //   var geocoder = new google.maps.Geocoder();

  //   geocoder.geocode({address: start}, function(results, status) {
  //     if (status == google.maps.GeocoderStatus.OK) {
  //     var mySResultLat = results[0].geometry.location.lat(); 
  //     var mySResultLng = results[0].geometry.location.lng(); 
  //       console.log(mySResultLat)
  //       console.log(mySResultLng)
  //   }
  //   });

  //   geocoder.geocode({address: endloc}, function(results, status) {
  //     if (status == google.maps.GeocoderStatus.OK) {
  //     var myEResultLat = results[0].geometry.location.lat();
  //     var myEResultLng = results[0].geometry.location.lng();
  //       console.log(myEResultLat)
  //       console.log(myEResultLng)
  //   }
  //   });
  // }

  //SHOWS INFOWINDOW FOR SEARCH 
  function bindInfoWindow(marker, map, infowindow, content) {
  marker.addListener('click', function(){
    infowindow.setContent(content);  
    infowindow.open(map, this);           
  }); 
  } 

  //SHOWS MAP
  function initMap() {
    var mySLatLng = new google.maps.LatLng(40.708445, -74.005666);
    var myOptions = {
      zoom: 12,
      center: mySLatLng
    }
    
    map = new google.maps.Map(document.getElementById('map'), myOptions);
    polyline = new google.maps.Polyline({
      path: []
    });
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsDisplay);

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

    var request = {
      origin: input,
      destination: input2,
      travelMode: google.maps.TravelMode[selectedMode]
    };

    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        polyline.setPath([]);
        var bounds = new google.maps.LatLngBounds();
        startLocation = new Object();
        endLocation = new Object();
        directionsDisplay.setDirections(response);
        var route = response.routes[0];
        // var summaryPanel = document.getElementById('directions_panel');
        // summaryPanel.innerHTML = "";

        // For each route, display summary information.
        var path = response.routes[0].overview_path;
        var legs = response.routes[0].legs;
            for (i=0;i<legs.length;i++) {
              if (i == 0) { 
                startLocation.latlng = legs[i].start_location;
                startLocation.address = legs[i].start_address;
                marker = createMarker(legs[i].start_location,'midpoint',"",'green');
              }

              endLocation.latlng = legs[i].end_location;
              endLocation.address = legs[i].end_address;
              var steps = legs[i].steps;
              for (j=0;j<steps.length;j++) {
                var nextSegment = steps[j].path;
                for (k=0;k<nextSegment.length;k++) {
                  polyline.getPath().push(nextSegment[k]);
                  bounds.extend(nextSegment[k]);
                }
              }
            }

        polyline.setMap(map);
        console.log()
        computeTotalDistance(response);
      } else {
        alert('directions response ' + status);
      }
    });    
  }

  var totalDist = 0;
  var totalTime = 0;
      function computeTotalDistance(result) {
        totalDist = 0;
        totalTime = 0;
        var myroute = result.routes[0];
        for (i = 0; i < myroute.legs.length; i++) {
          totalDist += myroute.legs[i].distance.value;
          totalTime += myroute.legs[i].duration.value;      
        }
        putMarkerOnRoute(50);
        console.log(totalDist)
        console.log(totalTime)
      }

      function putMarkerOnRoute(percentage) {
        var distance = (percentage/100) * totalDist;
        var time = ((percentage/100) * totalTime/60).toFixed(2);
        if (!marker) {
          marker = createMarker(polyline.GetPointAtDistance(distance),"time: "+ time + ' minutes');
        } else {
          marker.setPosition(polyline.GetPointAtDistance(distance));
          marker.setTitle('time:' + time);
          console.log(marker.getPosition().lat())
          console.log(marker.getPosition().lng())
        }
      }

  //FUNCTIONS THAT ONLY HIT ON SUBMIT
  $('#submit_button').click(function(){
    calculateAndDisplayRoute(directionsService, directionsDisplay);
    initMap()
    // searchAddress()
    });
});

