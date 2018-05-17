import React, { Component } from 'react';
import menu from './images/menu.png';
import './App.css';
import { places } from './components/places';
import Sidebar from './components/sidebar';
import Map from './components/map';
import escapeRegExp from 'escape-string-regexp';
import sortBy from 'sort-by';


class App extends Component {

	constructor(props) {
		super(props);
		this.toggle = this.toggle.bind(this);
		this.filters = this.filters.bind(this);
	}
	
	state = {
		sidebarHeight : window.innerHeight-48+'px',
		sidebarLeft : '-250px',
		locations : places,
		query : '',
		markers : '',
		map : ''
	}
	//function to toggle sidebar
	toggle() {
		this.setState((prevState)=>({
		sidebarLeft : prevState.sidebarLeft==='0px'?'-250px':'0px'
		}));
	}
	//function to filter by search query
	filters = (query)=>{
		this.setState({
			query : query.trim(),
		})
	}
	
	render() {
		//new array of the elements which match search query
		let showing
		if(this.state.query) {
			//regular expression script 
			const match = new RegExp(escapeRegExp(this.state.query),'i')
			showing = this.state.locations.filter((place)=>match.test(place.name))
		}
		else {
		//sort by script to sort by name
		showing = this.state.locations
		}
		
		showing.sort(sortBy('name'))
		return (
			<div role='banner' className="container">
			
				<header className="header">
					<img tabIndex='1'  src={menu} className="menu-icon" alt="menu-icon" onClick={this.toggle}/>
					<h1 tabIndex='-1'className="title">Sriganganagar</h1>
				</header>
				
				<Sidebar sidebarHeight={this.state.sidebarHeight} sidebarLeft={this.state.sidebarLeft} filters={this.filters} showing={showing} query={this.state.query} />
				
				<Map locations={this.state.locations} query={this.state.query} />
				
			</div>
		)
	}
}


export default App;