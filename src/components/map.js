import React, { Component } from 'react';
import { style } from './mapStyle';
import red from '../images/red-dot.png';
import blue from '../images/blue-dot.png';

class Map extends Component {
	
	constructor(props) {
		super(props);
		this.initMap = this.initMap.bind(this);
	}
	
	state = {
		query : '',
		markers : '',
		map : '',
		list : [],
		infoWindow : '',
		jump : ''
	}
	//Filter markers according to the query in search bar
	componentWillReceiveProps(props) {
		this.setState({
			query : props.query
		},()=>{
			for (var i = 0; i < this.props.locations.length; i++) {
			
				if (this.state.query.length === 0) {
					for (i = 0; i < this.props.locations.length; i++) {
						this.state.markers[i].setVisible(true);
					}
				} 
				else {
					for (i = 0; i < this.props.locations.length; i++) {
						if (this.state.markers[i].name.toLowerCase().indexOf(this.state.query.toLowerCase()) > -1) {
							this.state.markers[i].setVisible(true);
						} 
						else {
							this.state.markers[i].setVisible(false);
							this.state.infoWindow.close();
						}
					}
				}
			}
			/*for(i = 0; i < this.state.list.length; i++)
			{
				this.state.list[i].addEventListener('click',function(){
					this.state.jump(this.state.list[i].innerHTML)
				})
			}*/
		});
	}

	
	initMap() {
		var self = this;
		var list = [];
		var markers = [];
		var places = this.props.locations;
		var mapview = document.getElementById('map');
		mapview.style.height = window.innerHeight-48 + "px";
		var map = new window.google.maps.Map(mapview, {
			center: {lat: 29.904952, lng: 73.882942},
			zoom: 15,
			styles: style
		});
		this.setState({
			map : map
		})
		//Variable for infoWindow of markers
		var InfoWindow = new window.google.maps.InfoWindow();
		this.setState({
			infoWindow : InfoWindow
		})
		//Variable to store boundary of map on screen
		var bounds = new window.google.maps.LatLngBounds();
		//Default icon
		var defaultIcon = makeMarkerIcon(red);
		//Highlighted icon
		var highlightedIcon = makeMarkerIcon(blue);
		
		
		for(var i = 0 ; i < places.length ; i++ )
		{
			var position = places[i].position;
			var name = places[i].name;
			var id = places[i].unique;
			var marker  = new window.google.maps.Marker({
				map : map,
				position : position,
				name : name,
				icon : defaultIcon,
				animation: window.google.maps.Animation.DROP,
				id : id
			});
			//Inserting each marker in markers array
			markers.push(marker);
			//Extending bounds variable to accommodate this marker
			bounds.extend(marker.position);
			//Addind an on click event listener on every marker
			marker.addListener('click', function(){
				populateInfoWindow(this, InfoWindow, map);
				bounce(this);
			});
			// Two event listeners - one for mouseover, one for mouseout,
			// to change the colors back and forth.
			marker.addListener('mouseover', function () {
				this.setIcon(highlightedIcon);
			});
			marker.addListener('mouseout', function () {
				this.setIcon(defaultIcon);
			});
			this.setState({
				markers : markers
			})
		}
		window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });
		function jump(name){
			for(i = 0 ; i < markers.length ; i++)
			{
				if(markers[i].name === name)
				{
					bounce(markers[i]);
					populateInfoWindow(markers[i], InfoWindow, map);
				}
			}
		}
		this.setState({
			jump : jump
		})
		//Sidebar list items
		list = document.getElementsByTagName('li');
		for(i = 0; i < list.length; i++)
		{
			list[i].addEventListener('click',function(){
				jump(this.innerHTML)
			})
		}
		this.setState({
			list : list
		})
		//Adjusting the map boundaries to accommodate all markers
		map.fitBounds(bounds);
		//Getting the url of image for every marker from foursquare api
		for(var j = 0 ; j < markers.length ; j++)
		{
			getImg(markers[j]);
		}
		
		//Foursquare API call
		function getImg(marker) {
			marker.url=null;
			var url = "https://api.foursquare.com/v2/photos/" + marker.id + "?ll=40.7,-74&client_id=XQ2I0ONGSSVL1DYQYSK2Q0ERIM5ASTRANA5FRG41HTTXVKQB&client_secret=XIEY0CCAJUQ5U04C5XOLGDF3LGUXZ2GVWLEMCIWQ1FRZD4NQ&v=20170510";
			fetch(url).then(
				function (response) {
					if (response.status !== 200) {
						marker.url = null;
						return;
					}

					// Examine the text in the response
					response.json().then(function (data) {
						var pr = data.response.photo.prefix;
						var su = data.response.photo.suffix;
						var img = pr + '150x150' + su;
						marker.url = img;
					});
				}
			)
			.catch(function (err) {
				marker.url = null;
			});
		}
		
	}
	gm_authFailure() { 
        document.getElementById('map').innerHTML='Could not load Google Maps';
    };
	componentDidMount() {
		window.gm_authFailure = this.gm_authFailure;
		window.initMap = this.initMap;
		loadMap('https://maps.googleapis.com/maps/api/js?key=AIzaSyD-eRWsMKZn7oqlRkui_vmfzLfagxEOaPY&v=3&callback=initMap')
	}

	render() {
		return (
			<div id="map" role="application" aria-label="Map with restaurants">
			</div>
		)
	}
}

//Function to make a marker bounce on clicking on it
function bounce(marker) {
	if (marker.getAnimation() !== null)
	{
		marker.setAnimation(null);
	}
	else
	{
		marker.setAnimation(window.google.maps.Animation.BOUNCE);
		window.setTimeout(function(){
			marker.setAnimation(null);
		},1450);
	}
}

//Function to fill the infoWindow on basis of clicked marker
function populateInfoWindow(marker, infoWindow, map) {
	if(infoWindow.marker !== marker)
	{
		infoWindow.marker = marker;	
		infoWindow.setContent(
			marker.url==null ? '<div>Image failed to load!</div>':'<div>' + marker.name +  '</div><br><img src="' + marker.url + '" alt='+ marker.name +'>'
			);
		infoWindow.open(map, marker);
		infoWindow.addListener('closeclick', function(){
			infoWindow.close();
			infoWindow.marker = undefined;
		});
	}
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
	var markerImage = new window.google.maps.MarkerImage(
		markerColor ,
		new window.google.maps.Size(34, 34),
		new window.google.maps.Point(0, 0),
		new window.google.maps.Point(10, 34),
		new window.google.maps.Size(34, 34));
	return markerImage;
}
//Async call to google maps api
function loadMap(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = mapLoadError();
    ref.parentNode.insertBefore(script, ref);
}

function mapLoadError(){
	document.getElementById('map').innerHTML='Could not load Google Maps';
}

export default Map;