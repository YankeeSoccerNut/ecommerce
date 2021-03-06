import React, { Component } from 'react';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import LogoutAction from '../actions/LogoutAction';

class Logout extends Component {

componentDidMount(){
  this.props.logoutAction();
  this.props.history.push('/');
};

render(){
    return(
      <div>
        Logging out.....
      </div>
    )
  }
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    logoutAction: LogoutAction
  }, dispatch);
};

export default connect(null, mapDispatchToProps)(Logout);
