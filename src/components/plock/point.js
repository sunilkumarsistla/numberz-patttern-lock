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

        return (<li onMouseDown={e=>addNode.bind(this)(e, model)}
                    onMouseEnter={e=>addNode.bind(this)(e, model)}
                    data-k={model.id} 
                    className={btnClass}>
                    <div className={'dot'}></div>
                </li>);
    }    
}

export default Point;