import React, { Component } from 'react';

class Line extends Component {
    render() {
        const { model } = this.props;
        return model ? (<div className="line" style={model.style}></div>) : null;
    }    
}

export default Line;