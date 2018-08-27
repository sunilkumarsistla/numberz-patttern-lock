import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setPattern, matchPattern } from './actions/patternLockAction';
import Grid from './components/plock'
import './App.css';

class App extends Component {
  
  setPattern = (pattern) => {
    this.props.setPattern(pattern);
  }

  attempt = (pattern) => {
    this.props.attempt(pattern);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className={'pattern-lock'}>
          <div className={'grid-holder'}>
            <p className="App-intro">Set Lock</p>
            <Grid onComplete={this.setPattern.bind(this)} />
          </div>
          <div className={'grid-holder'}>
            <p className="App-intro">Test</p>
            <Grid onComplete={this.attempt.bind(this)} />
          </div>
          <p>&nbsp;</p>
          <div >
            Pattern: {this.props.pattern.toString()}
            <br />
            Status: {this.props.status} { this.props.fail_count || ''}
          </div>
        </div>        
      </div>
    );
  }
}

const mapStateToProps = state => state.plock;

const mapDispatchToProps = dispatch => ({
  setPattern: p => dispatch(setPattern(p)),
  attempt: p => dispatch(matchPattern(p))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
