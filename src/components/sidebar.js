import React, { Component } from 'react';

class Sidebar extends Component {
	
	render() {
		return (
			<div role='list' className="sidebar" style={{height:this.props.sidebarHeight, left:this.props.sidebarLeft}}>
				<h3>Search <input tabIndex='2' aria-label='Enter search text' placeholder='search' type="text" value={this.props.query} onChange={event=>this.props.filters(event.target.value,this.props.showing)}/></h3>
				<ul role='menu'>
					{this.props.showing.map(place => (<li tabIndex='0' role='menuitem' key={place.name} >{place.name}</li>))}
				</ul>
				<p>Powered by Foursquare Api</p>
			</div>
		)
	}
}

export default Sidebar;