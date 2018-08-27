import React, { Component } from 'react';
import Point from './point';

const defaults = {
    gridW: 3,
    gridH: 3
}

class Grid extends Component {
    
    ele; //grid
    isTracking; // flag to see if user is drawing
    path; // tracked points by user currently
    defPoints; // default point object -- easy to reset counter

    constructor(props) {
        super(props);
        this.state = {
            pattern: [],
            points: [],

            lines: [],
            aLine: {}
        };

        this.path = [];
        this.defPoints = [];
        const totPoints = defaults.gridW * defaults.gridH;
        for(let i=0;i<totPoints;i++) {
            this.defPoints.push({ id: i+1, isMarked: false, isError: false });
        }
        this.state.points = [...this.defPoints];
        this.ele = React.createRef();
    }

    componentDidMount() {
        this.ele.addEventListener('mousedown', this.startTracking);
    }
    
    getLengthAndAngleForLine = (x1, x2, y1, y2) => {
        var xDiff = x2 - x1,
            yDiff = y2 - y1;

        return {
            length: Math.ceil(Math.sqrt(xDiff * xDiff + yDiff * yDiff)),
            angle: Math.round((Math.atan2(yDiff, xDiff) * 180) / Math.PI)
        };
    }

    addNode = p => {
        if(p.isMarked) return;
                
        //todo: check if there is something in between the nodes
        var pattern = [...this.state.pattern];
        var points = [...this.state.points];

        if(this.state.pattern.length > 0) {
            // we always have only one middle point in this scenario so look for average
            const lastId = this.state.pattern[this.state.pattern.length-1];
            const avg = (lastId + p.id)/2, diff = Math.abs(lastId - p.id);
            if(diff === 2 || diff === 6 || avg === 5 && !points[avg-1].isMarked) {
                points[avg-1] = {...points[avg-1], isMarked: true};
                pattern = [...pattern, avg];
            }
        }

        points[p.id-1] = {...points[p.id-1], isMarked: true};
        pattern = [...pattern, p.id];

        // prepare lines for added nodes
        
        this.setState({
            ...this.state,
            pattern: pattern,
            points: points,
            lines: []
        });
    }

    complete = () => {
        this.props.onComplete(this.state.pattern);
        this.resetGrid();
    }

    resetGrid = () => {
        this.setState({
            pattern: [],
            points: [...this.defPoints],
        });
        this.path = [];
        this.isTracking = false;
    }

    startTracking = e => {
        e.preventDefault();
        this.resetGrid();
        this.ele.addEventListener("mousemove", this.trackingHandler);
        document.addEventListener("mouseup", this.endTracking);
        this.isTracking = true;
    }

    trackingHandler = e => {
        e.preventDefault();
        var x = e.clientX || e.originalEvent.touches[0].clientX,
        y = e.clientY || e.originalEvent.touches[0].clientY;

        if(this.path.length > 0) {
            const lastP = this.path[this.state.path.length-1];
        }
    }

    mouseOnPoint = (e, p) => {
        if(!this.isTracking || p.isMarked) { 
            e.preventDefault();
            return;
        }
        this.addNode(p);
    }

    endTracking = e => {
        e.preventDefault();
        this.isTracking = false;
        this.ele.removeEventListener('mousemove', this.trackingHandler);
        document.removeEventListener("mouseup", this.endTracking);

        this.complete();
    }

    render() {
        const gPoints = this.state.points.map((x) => (<Point key={x.id} model={x} addNode={this.mouseOnPoint}/>));
        const gLines = this.state.lines.map((x, i) => (<div key={i} className="line" style={x.style}></div>));
        return (
            <div>
                <div className={'grid-container'} ref={e => this.ele = e}>
                    <ul className={'grid'}>
                        {gPoints}
                    </ul>
                    {gLines}
                </div>
            </div>
        );
    }
}

export default Grid;
