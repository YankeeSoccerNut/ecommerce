import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { Form, Button, Col } from 'react-bootstrap';
import GetProductLines from '../actions/GetProductLines';
import LoginAction from '../actions/LoginAction';

class NavBar extends Component{
  constructor(){
    super();
    this.fakeLogin = this.fakeLogin.bind(this)
  };

  fakeLogin(){
    console.log("in fakeLogin....about to take action");
    this.props.loginAction('fake');
  };
  componentDidMount(){
    this.props.getProductLines();
  };

  componentWillReceiveProps(newProps){
    console.log("componentWillReceiveProps\n, newProps");
  };

  render(){

    console.log(this.props.cart);
    let cartText = "";
    let rightMenuBar = "";

    if(this.props.auth.token !== undefined){
      if(this.props.cart.totalPrice !== undefined){
        const totalPrice = this.props.cart.totalPrice;
        const totalItems = this.props.cart.totalItems;
        cartText = `(${totalItems} items in your cart | ($${totalPrice})`;
      } else {
        cartText = "Your cart is empty";
      };

      rightMenuBar = [
        <span key={1}>Welcome, {this.props.auth.name}</span>,
        <span key={2}><Link to="/cart">{cartText}</Link></span>,
        <span key={3}><Link to="/logout">Logout</Link></span>
      ];
    } else {
      rightMenuBar = [
        <span key={0}><button className="btn btn-primary" onClick={this.fakeLogin}>FAKE LOGIN</button></span>,
        <span key={1}><Link to="/login">Sign In</Link> or <Link to="/register">Create an Account</Link></span>,
        <span key={2}><Link to="/cart">(0) items in your cart | ($000)</Link></span>
      ]
    };

    let shopMenu = this.props.pl.map((prod, index)=>{
      const safeLink = encodeURIComponent(prod.productLine);
      return(<Link key={index} to={`/shop/${safeLink}`}>{prod.productLine}</Link>);
    });

    return(
      <div id="mynavbar">
        <nav className="navbar navbar-fixed-top">
            <div className="container-fluid navbar-white">
              <div className="container">
                <ul className="nav navbar-nav">
                  <li key={1}><Link to="/home">Home</Link></li>
                  <li key={2} className="dropdown">
                    <Link to="/shop"><i className="arrow down" />Shop</Link>
                    <ul>
                      <li className="dropdown-links">
                        {shopMenu}
                      </li>
                    </ul>
                  </li>
                  <li key={3}><Link to="/about">About Us</Link></li>
                  <li key={4}><Link to="/contact">Contact Us</Link></li>
                </ul>
              </div>
            </div>
            <div className="container-fluid navbar-default">
              <div className="container">
                <div className="nav navbar-header">
                  ClassicModels Logo
                </div>
                <div className="nav navbar-nav pull-right">
                  {rightMenuBar}
                </div>
              </div>
            </div>
          </nav>
      </div>
    )
  }
}


function mapStateToProps(state){
  // state = rootReducer
  // key will become this.props.key and accessible to this component
  // value is a property of the RootReducer which is a reference to the reducer function

  return {
    auth: state.auth,
    pl: state.pl,
    cart: state.cart
  };
};

function mapDispatchToProps(dispatch){
  return bindActionCreators(
    {getProductLines: GetProductLines,
    loginAction: LoginAction },
    dispatch
  );
}
export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
