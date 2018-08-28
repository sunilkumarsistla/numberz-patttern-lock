import React, { Component } from 'react';
import classNames from 'classnames';

class Point extends Component {
    render() {
        const { addNode, model } = this.props;
        const btnClass = classNames({
            'point': true,
            'touched': model.isMarked,
            'error': model.isError
        });
        
        return model ? (
            <li onMouseDown={e=>addNode(e, model)}  
                onMouseMove={e=>addNode(e, model)} 
                className={btnClass}>
                <div className="dot"></div>
            </li>
        ) : null;
    }    
}

export default Point;