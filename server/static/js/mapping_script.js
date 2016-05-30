var map;
var bounds;

var setROUTE = true;
var setPATH = [];
var setROUTEmarkers = [];
var setPoly;


function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: -37.48, lng: 144.57},
		zoom: 16
	});

    setPoly = new google.maps.Polyline({
        geodesic: true,
        strokeColor: "blue",
        strokeOpacity: 0.6,
        strokeWeight: 4
    });
    setPoly.setMap(map);

    bounds = new google.maps.LatLngBounds();

	map.addListener('click', addLatLng);
}

 window.setInterval(function(){
        updater();
    }, 10);

function updater()
{
    if(setROUTE === true){
        setPATH = [];
        for(i=0; i<setROUTEmarkers.length; i++){
            var pos = setROUTEmarkers[i].position;
            setPATH.push(pos);
            bounds.extend(pos);
        }
        if(setROUTEmarkers.length>1){
            setPoly.setPath(setPATH);
        }
    }
}

function addLatLng(event) 
{
	if(setROUTEmarkers.length <= 1){
	    setROUTEmarkers.push(
	      marker = new google.maps.Marker({
	        position: event.latLng,
	        map: map,
	        draggable: true
	      })
	    );
	    marker.addListener('click', byeMarker);
	    bounds.extend(event.latLng);
	}else if(setROUTEmarkers.length == 2){
		var bearing = google.maps.geometry.spherical.computeHeading(setROUTEmarkers[0].position,setROUTEmarkers[1].position);
		console.log(bearing);
		if(((bearing>-45 && bearing<45 || bearing > 135 || bearing< -135) && (setROUTEmarkers[1].position.lng()<event.latLng.lng() )|| ((bearing<-45 && bearing > -135 || bearing > 45 && bearing< 135) && setROUTEmarkers[1].position.lat()<event.latLng.lat()))){
			var nxtbearing = bearing - 90;
		}else{
			var nxtbearing = bearing + 90;
		}

		var dist = google.maps.geometry.spherical.computeDistanceBetween(setROUTEmarkers[1].position, event.latLng)/1000;

		setROUTEmarkers.push(
	      marker = new google.maps.Marker({
	        position: pointFromBearingAndDistance(setROUTEmarkers[1],nxtbearing,dist),
	        map: map,
	        draggable: true
	      })
	    );
	    marker.addListener('click', byeMarker);
	    bounds.extend(event.latLng);
	}else if(setROUTEmarkers.length>2){
		map.fitBounds(bounds);
    }
}


function byeMarker(event)
{
  for(i=0; i<setROUTEmarkers.length; i++){
    if(setROUTEmarkers[i].position==event.latLng){
      var marker = setROUTEmarkers[i];
      marker.setMap(null);
      marker = null;
      setROUTEmarkers.splice(i,1);
    }
  }
}

function rootFinder(fof,target,initial,eps,changeIndexes){
	var fval = fof(...initial);
	var val = initial;
	var oldval;
	var forward = true;
	while(fval!=target){
		for(i=0; i<changeIndexes.length; i++){
			oldval = val.slice();
			if(fval>target){
				if(forward){
					val[changeIndexes[i]]+=eps;
					val[changeIndexes[i]]=Number(val[changeIndexes[i]].toFixed(Math.round(Math.abs(Math.log10(eps)))));
					fval = fof(...val);
					if(val[changeIndexes[i]]>oldval[changeIndexes[i]]){
						forward = false;
					}
				}else{
					val[changeIndexes[i]]-=eps;
					val[changeIndexes[i]]=Number(val[changeIndexes[i]].toFixed(Math.round(Math.abs(Math.log10(eps)))));
					fval = fof(...val);
					if(val[changeIndexes[i]]>oldval[changeIndexes[i]]){
						forward = true;
					}
				}
			}else if(fval<target){
				if(forward){
					val[changeIndexes[i]]-=eps;
					val[changeIndexes[i]]=Number(val[changeIndexes[i]].toFixed(Math.round(Math.abs(Math.log10(eps)))));
					fval = fof(...val);
					if(val[changeIndexes[i]]<oldval[changeIndexes[i]]){
						forward = false;
					}
				}else{
					val[changeIndexes[i]]+=eps;
					val[changeIndexes[i]]=Number(val[changeIndexes[i]].toFixed(Math.round(Math.abs(Math.log10(eps)))));
					fval = fof(...val);
					if(val[changeIndexes[i]]<oldval[changeIndexes[i]]){
						forward = true;
					}
				}
			}
		}

	}
	return val;
}

function pointFromBearingAndDistance(start,bearing,distance){
	//OUTPUT IN KM
	var R = 6371;
	var brng = bearing * Math.PI/180;
	var d = distance;
	var oldLat = start.position.lat() * Math.PI/180;
	var oldLng = start.position.lng() * Math.PI/180;


	var newLat = Math.asin(Math.sin(oldLat)*Math.cos(d/R) + Math.cos(oldLat)*Math.sin(d/R)*Math.cos(brng));
	var newLng = oldLng + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(oldLat), Math.cos(d/R)-Math.sin(oldLat)*Math.sin(newLat));

	return {lat: newLat*(180/Math.PI), lng: ((newLng*(180/Math.PI)+540)%360-180)};
}



//TESTING FUNCTIONS
function add(a,b){
	return a+b;
}

console.log(rootFinder(add,6,[4,1],0.1,[0,1]));