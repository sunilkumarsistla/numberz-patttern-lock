import React, { Component } from 'react';
import textEncoder from '../../providers/base64encoder';
//import classNames from 'classnames';

import Point from './point';
import Line from './line';

const nullFunc = () => {};
const defaultOptions = {
    matrix: [3, 3],
    margin: 20,
    radius: 25,
    isError: false
};

const eventlookup = {
    'mousedown': { track: 'mousemove', stop: 'mouseup' },
    'touchstart': { track: 'touchmove', stop: 'touchend' },
}

class Grid2 extends Component {
    option; container; evtMap; isTracking;
    lastPt;

    //react component cycle
    constructor(props) {
        super(props);
        this.option = props.option || {};
        var defaultsActions = {
            onDraw: nullFunc
        };
        this.option = { ...defaultOptions, ...defaultsActions, ...this.option };
        this.wrapLeft = this.wrapTop = 0;
        this.line = {};

        // set default state
        var gridPoints = [];
        const gridSize = this.option.matrix[0] * this.option.matrix[1];
        for(let i=0;i<gridSize; i++) {
            gridPoints.push({
                id: (i + 1),
                isTouched: false,
                isError: false,
                ref: undefined
            });
        }
        this.state = {
            points: gridPoints,     
            lines: [],
            arbLine: [],
            pattern: [],
        }
    }

    render = () => {
        const points = this.state.points.map(p => <Point addNode={this.mouseOnPoint} ref={e => p.ref = e} key={p.id} model={p} />);
        const lines = this.state.lines.map((l, i) => <Line key={i} model={l} />);
        const { aLine } = this.state;
    
        //set style for container
        const { matrix, margin, radius } = this.option;
        const containerStyle = { width: (matrix[1] * (radius * 2 + margin * 2) + margin * 2) + 'px',
           height:  (matrix[0] * (radius * 2 + margin * 2) + margin * 2) + 'px'
        };

        return(
            <div className="grid-container" style={containerStyle} ref={ ele => this.container = ele } >
                <ul className="grid">{points}</ul>
                {lines}
                <Line model={aLine}/>
            </div>
        );
    }    

    componentDidMount = () => {
        this.wrapLeft = 0;
        this.wrapTop = 0;
        for(const k in eventlookup) {
            this.container.addEventListener(k, this.startTracking);
        }
    }

    componentWillUnmount = () => {
        for(const k in eventlookup) {
            this.container.removeEventListener(k, this.startTracking);
        }
    }
    
    reset = () => {
        var gridPoints = [];
        const gridSize = this.option.matrix[0] * this.option.matrix[1];
        for(let i=0;i<gridSize; i++) {
            gridPoints.push({
                id: (i + 1),
                isTouched: false,
                isError: false,
                ref: undefined
            });
        }

        this.lastPt = null;
        this.setState(...this.state,
            {
                points: gridPoints,     
                lines: [],
                aLine: null,
                pattern: [],
            });
    }

    // events
    mouseOnPoint = (e, p) => {
        e.preventDefault();
        if(!this.isTracking || p.isMarked) return;
        const x = e.clientX || e.originalEvent.touches[0].clientX,
            y = e.clientY || e.originalEvent.touches[0].clientY;
            
        this.addNode(e, p);
    }

    startTracking = (e) => {
        e.preventDefault();
        if(!eventlookup.hasOwnProperty(e.type)) return;

        this.evtMap = eventlookup[e.type];
        this.container.addEventListener(this.evtMap.track, this.keepTracking);
        document.addEventListener(this.evtMap.stop, this.stopTracking);

        this.isTracking = true;
        this.reset();
    }

    keepTracking = (e) => {
        e.preventDefault();
        const x = (e.clientX || e.originalEvent.touches[0].clientX) - this.container.offsetLeft,
            y =  (e.clientY || e.originalEvent.touches[0].clientY) - this.container.offsetTop;

        if(this.lastPt) {
            
            const { width, angle } = this.getLineStyle(
                this.lastPt.offsetLeft,
                this.lastPt.offsetTop, 
                x, 
                y);

            var line = { style: { 
                width: width + 'px',
                transform: 'rotate(' + angle + 'deg)', 
                top: this.lastPt.offsetTop + this.option.radius - 5 + 'px', 
                left: this.lastPt.offsetLeft + this.option.radius - 5 + 'px' }};

            this.setState({
                ...this.state,
                aLine: line
            });
        }
    }

    stopTracking = (e) => {
        e.preventDefault();
        this.container.removeEventListener(this.evtMap.track, this.keepTracking);
        document.removeEventListener(this.evtMap.stop, this.stopTracking);
        this.isTracking = false;
        
        const pattern = this.state.pattern.toString();
        if(!pattern) return;

        this.setState({
            aLine: undefined
        });
        const encodedPattern = textEncoder.encode(pattern);
        this.props.onComplete(encodedPattern);
    }

    getLineStyle(x1, y1, x2, y2) {
        var xDiff = x2 - x1,
            yDiff = y2 - y1;

        return {
            width: Math.ceil(Math.sqrt(xDiff * xDiff + yDiff * yDiff)),
            angle: Math.round((Math.atan2(yDiff, xDiff) * 180) / Math.PI)
        };
    }

    getRowIndex = id => Math.floor((id - 1) / this.option.matrix[0]);
    getColIndex = id => (id - 1) % this.option.matrix[0];

    addNode = (e, p) => {
        if(p.isMarked) return;

        var pattern = [...this.state.pattern];
        var points = [...this.state.points];
        var lines = [...this.state.lines];

        if(this.state.pattern.length > 0) {
            const lastId = this.state.pattern[this.state.pattern.length-1];

            // check for any jumps if not add next point directly
            const rs = Math.abs(this.getRowIndex(p.id) - this.getRowIndex(lastId));
            const cs = Math.abs(this.getColIndex(p.id) - this.getColIndex(lastId));
            
            // find what kind of shift it is
            const isRS = rs > 1 && cs === 0,
                isCS = cs > 1 && rs === 0,
                isDS = rs === cs && rs > 1;

            if(isRS || isCS || isDS) {
                // steps for each kind of shift
                const rowStep = this.option.matrix[0];
                const colStep = 1;
                const diagStep = Math.abs(lastId - p.id) / rs;

                var cp = lastId;
                while(cp !== p.id) {
                    if (this.state.pattern.indexOf(cp) === -1) {
                        points[cp-1] = {...points[cp-1], isMarked: true};
                        pattern.push(cp);
                    }
                    if(p.id > cp)
                        cp += isDS ? diagStep : (isCS ? colStep : rowStep);
                    else 
                        cp -= isDS ? diagStep : (isCS ? colStep : rowStep);
                }
            }
        }

        // build line for the points
        if(this.lastPt) {
            const ele = e.currentTarget;
            const { width, angle } = this.getLineStyle(
                this.lastPt.offsetLeft,
                this.lastPt.offsetTop, 
                ele.offsetLeft, 
                ele.offsetTop);

            var line = { style: { 
                width: width + 10 + 'px',
                transform: 'rotate(' + angle + 'deg)', 
                top: this.lastPt.offsetTop + this.option.radius - 5 + 'px', 
                left: this.lastPt.offsetLeft + this.option.radius - 5 + 'px' }};

            lines = [...lines, line];
        }

        points[p.id-1] = {...points[p.id-1], isMarked: true};
        pattern = [...pattern, p.id];
        this.lastPt = e.currentTarget;

        //todo: prepare lines for added nodes
        this.setState({
            ...this.state,
            pattern: pattern,
            points: points,
            lines: lines
        });
    }
}

export default Grid2;