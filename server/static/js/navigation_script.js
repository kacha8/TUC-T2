var companyName;

//MAP FUNCTIONS
var map;
var bounds;
var currentPos;

//GRID
var setPATH = [];
var setPoly;

var gridPathx = [];
var gridPolyx;
var gridPathy = [];
var gridPolyy;

function loadSettings(){
	var inPathSTR;

	//for test purposes
	//server is meant to supply settings
	var inPathSTR = '[{"lat":-37.821243049087585,"lng":144.9550724029541},{"lat":-37.815276404447616,"lng":144.97485637664795},{"lat":-37.80735958333689,"lng":144.97103207480086},{"lat":-37.81332959775782,"lng":144.95122646073673}]';


	var inPath = JSON.parse(inPathSTR);	

	for(i=0; i<inPath.length; i++){
		setPATH.push(new google.maps.LatLng(inPath[i]));

	}	
	setPoly.setPath(setPATH);

	generateGrid();
}


function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: -37.814205129899264, lng: 144.96328043060305},
		zoom: 15
	});

    setPoly = new google.maps.Polygon({
        geodesic: true,
        strokeColor: "blue",
        strokeOpacity: 0.6,
        strokeWeight: 4,
        fillOpacity: 0,
        clickable: false
    });
    setPoly.setMap(map);

    gridPolyx = new google.maps.Polyline({
        geodesic: true,
        strokeColor: "grey",
        strokeOpacity: 0.2,
        strokeWeight: 1,
        clickable: false
    });
    gridPolyx.setMap(map);
    
    gridPolyy = new google.maps.Polyline({
        geodesic: true,
        strokeColor: "grey",
        strokeOpacity: 0.2,
        strokeWeight: 1,
        clickable: false
    });

    var image = {
        url: '../static/css/images/currentPosIcon.png', 
        size: new google.maps.Size(20,20),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(10,10)
    };

    currentPos = new google.maps.Marker({
	    title: 'Current Position',
	    map: map,
	    icon: image

	    //for debugging
	    ,draggable: true,
	    position: {lat: -37.814205129899264, lng: 144.96328043060305}
    });


    gridPolyy.setMap(map);

    map.addListener('click', addLatLng);

	google.maps.event.addListenerOnce(map, 'idle', function(){
	    loadSettings();
	});

}

var positionOptions = {
        enableHighAccuracy: true,
        timeout: 5000, 
        maximumAge: 0
    };

function startTracking(){
    var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false,window,0);
    window.dispatchEvent(evt);
    console.log("map reload");

	$("#activate")[0].style.zIndex = -3;
	$("#app")[0].style.zIndex = 10;
	if (navigator.geolocation){     
	    $('.gpsError').hide();
	    window.setInterval(function(){
	        navigator.geolocation.getCurrentPosition(showCurrentLocation, errorHandler, positionOptions);
	    }, 5000);
	    
	}else{
	    $('.gpsValue').hide();
	}
}
function errorHandler(error)
{
    if(error.code == 0){
        console.log("Unknown error");
    }
    if(error.code == 1){
        console.log("Access denied by user");
    }

    if(error.code == 2){ 
        console.log("Position unavailable");
    }

    if(error.code == 3){
        console.log("Timed out");
    }
}


function showCurrentLocation(position)
{        
    currentPos.setPosition({lat: position.coords.latitude, lng: position.coords.longitude});
    map.setCenter(currentPos.position);
}


function addLatLng(event) 
{

}

function byeMarker(event)
{

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
	var oldLat = start.lat * Math.PI/180;
	var oldLng = start.lng * Math.PI/180;


	var newLat = Math.asin(Math.sin(oldLat)*Math.cos(d/R) + Math.cos(oldLat)*Math.sin(d/R)*Math.cos(brng));
	var newLng = oldLng + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(oldLat), Math.cos(d/R)-Math.sin(oldLat)*Math.sin(newLat));

	return {lat: newLat*(180/Math.PI), lng: ((newLng*(180/Math.PI)+540)%360-180)};
}

function intesectionGivenBearing(point1, bearing1, point2, bearing2){
	var lat1 = point1.lat * Math.PI/180;
	var lng1 = point1.lng * Math.PI/180;
    var lat2 = point2.lat * Math.PI/180;
    var lng2 = point2.lng * Math.PI/180;
    var bring1 = Number(bearing1) * Math.PI/180;
    var bring2 = Number(bearing2) * Math.PI/180;
    var dellat = lat2-lat1;
    var dellng = lng2-lng1;

    var hangdist = 2*Math.asin( Math.sqrt( Math.sin(dellat/2)*Math.sin(dellat/2) + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dellng/2)*Math.sin(dellng/2) ) );
    if (hangdist == 0) return null;

    // bearing between points
    var θ1 = Math.acos( ( Math.sin(lat2) - Math.sin(lat1)*Math.cos(hangdist) ) / ( Math.sin(hangdist)*Math.cos(lat1) ) );
    if (isNaN(θ1)) θ1 = 0; // protect against rounding
    var θ2 = Math.acos( ( Math.sin(lat1) - Math.sin(lat2)*Math.cos(hangdist) ) / ( Math.sin(hangdist)*Math.cos(lat2) ) );

    var θ12 = Math.sin(lng2-lng1)>0 ? θ1 : 2*Math.PI-θ1;
    var θ21 = Math.sin(lng2-lng1)>0 ? 2*Math.PI-θ2 : θ2;

    var α1 = (bring1 - θ12 + Math.PI) % (2*Math.PI) - Math.PI; // angle 2-1-3
    var α2 = (θ21 - bring2 + Math.PI) % (2*Math.PI) - Math.PI; // angle 1-2-3

    if (Math.sin(α1)==0 && Math.sin(α2)==0) return null; // infinite intersections
    if (Math.sin(α1)*Math.sin(α2) < 0) return null;      // ambiguous intersection

    var α3 = Math.acos( -Math.cos(α1)*Math.cos(α2) + Math.sin(α1)*Math.sin(α2)*Math.cos(hangdist) );
    var δ13 = Math.atan2( Math.sin(hangdist)*Math.sin(α1)*Math.sin(α2), Math.cos(α2)+Math.cos(α1)*Math.cos(α3) );
    var lat3 = Math.asin( Math.sin(lat1)*Math.cos(δ13) + Math.cos(lat1)*Math.sin(δ13)*Math.cos(bring1) );
    var dellng3 = Math.atan2( Math.sin(bring1)*Math.sin(δ13)*Math.cos(lat1), Math.cos(δ13)-Math.sin(lat1)*Math.sin(lat3) );
    var lng3 = lng1 + dellng3;

	return {lat: lat3*(180/Math.PI), lng: ((lng3*(180/Math.PI)+540)%360-180)};
}

function LATLNGtolatlng(a){
	var latlng = {lat: a.lat(), lng: a.lng()};
	return latlng;
}

function generateGrid(){
	gridPathx = [];
	gridPolyx;
	gridPathy = [];
	gridPolyy;
	gridPolyx.setPath(gridPathx);
	gridPolyy.setPath(gridPathy);

	var bearingx = google.maps.geometry.spherical.computeHeading(setPATH[0],setPATH[1]);
	var bearingx2 = google.maps.geometry.spherical.computeHeading(setPATH[1],setPATH[0]);
	var bearingy = google.maps.geometry.spherical.computeHeading(setPATH[1],setPATH[2]);
	var bearingy2 = google.maps.geometry.spherical.computeHeading(setPATH[2],setPATH[1]);
	var odist = google.maps.geometry.spherical.computeDistanceBetween(setPATH[1], setPATH[0])/1000;
	var hdist = google.maps.geometry.spherical.computeDistanceBetween(setPATH[1], setPATH[2])/1000;
	var newpt;
	var oldpt =  LATLNGtolatlng(setPATH[0]);
	var flip = true;

	gridPathx.push(setPATH[0]);
	var gridWidth = 0;
	while(gridWidth<odist-0.01){
		newpt = pointFromBearingAndDistance(oldpt,bearingx,0.010);
		gridPathx.push(newpt);
		gridWidth+=0.010;
		oldpt=newpt;
		if(flip){
			newpt = pointFromBearingAndDistance(oldpt,bearingy,hdist);
			flip = false;
		}else{
			newpt = pointFromBearingAndDistance(oldpt,bearingy2,hdist);
			flip = true;
		}
		gridPathx.push(newpt);
		oldpt=newpt;
	}
	gridPolyx.setPath(gridPathx);
	
	gridPathy.push(setPATH[0]);
	var oldpt =  LATLNGtolatlng(setPATH[0]);
	var flip = true;
	var gridWidth = 0;
	while(gridWidth<hdist-0.01){
		newpt = pointFromBearingAndDistance(oldpt,bearingy,0.010);
		gridPathy.push(newpt);
		gridWidth+=0.010;
		oldpt=newpt;
		if(flip){
			newpt = pointFromBearingAndDistance(oldpt,bearingx,odist);
			flip = false;
		}else{
			newpt = pointFromBearingAndDistance(oldpt,bearingx2,odist);
			flip = true;
		}
		gridPathy.push(newpt);
		oldpt=newpt;
	}
	gridPolyy.setPath(gridPathy);


}

function tileNo(pos){
	var bearingx = google.maps.geometry.spherical.computeHeading(setPATH[0],setPATH[1]);
	var bearingy = google.maps.geometry.spherical.computeHeading(setPATH[3],setPATH[0]);
	var bearingx2 = google.maps.geometry.spherical.computeHeading(setPATH[1],setPATH[0]);
	var bearingy2 = google.maps.geometry.spherical.computeHeading(setPATH[0],setPATH[3]);

	var xint = intesectionGivenBearing(LATLNGtolatlng(pos), bearingy, LATLNGtolatlng(setPATH[0]), bearingx);
	console.log(xint);

	var yint = intesectionGivenBearing(LATLNGtolatlng(pos), bearingx2, LATLNGtolatlng(setPATH[0]), bearingy2);
	console.log(yint);

	var xdist = google.maps.geometry.spherical.computeDistanceBetween(setPATH[0], new google.maps.LatLng(xint))/1000;
	var ydist = google.maps.geometry.spherical.computeDistanceBetween(setPATH[0], new google.maps.LatLng(yint))/1000;

	var xNo = Math.ceil(xdist/0.01);
	var yNo = Math.ceil(ydist/0.01);

	var tile = xNo + "-" + yNo
	return tile;

}