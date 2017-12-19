import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GetCart from '../actions/GetCart';
import CartRow from '../components/CartRow';
import axios from 'axios';

class Cart extends Component{

  constructor(){
    super();
    this.makePayment = this.makePayment.bind(this);
  };

  makePayment() {
    console.log("makePayment..props:\n", this.props);

    var handler = window.StripeCheckout.configure({
        key: 'pk_test_7uCuizJssbFmfkW8Vv3kB057',
        locale: 'auto',
        token: (token) => {
            var theData = {
                amount: this.props.cart.totalPrice * 100,
                stripeToken: token.id,
                userToken: this.props.auth.token
            }
            axios({
                method: 'POST',
                url: `${window.apiHost}/stripe`,
                data: theData
            }).then((response) => {
                console.log(response);
                if (response.data.msg === 'paymentSuccess') {
                  this.props.history.push('/thankyou');
                } else {
                  console.log(response.data.msg);
                };
            });
        }
    });

    handler.open({
        name: "Pay Now",
        description: 'Classic Model Checkout',
        amount: this.props.cart.totalPrice * 100
    })
};

  componentDidMount(){
    console.log("Cart Component Did Mount\n", this.props);
    if (this.props.auth.token === undefined){
      // no token...redirect to login
      this.props.history.push('/login');
    } else {
      // valid token...getCart
      this.props.getCart(this.props.auth.token);
    }
  };

  componentWillReceiveProps(newProps){
    console.log("componentWillReceiveProps\n", newProps);
  };

  render(){

    console.log(this.props.cart);
    if(!this.props.cart.totalItems){
      return(
      <div>
        <h3>Your cart is empty! Get shopping!</h3>
      </div>
      );
    };

    let cartArray = this .props.cart.products.map((product, index)=>{
      // console.log(product);
      return(
        <CartRow key={index} product={product} />
      );
    });

    return(
      <div>
        <h2>Your order total is: ${this.props.cart.totalPrice}  <button onClick={this.makePayment} className="btn btn-success">Checkout</button></h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {cartArray}
          </tbody>
        </table>
      </div>
    )
  };
};


function mapStateToProps(state){
  // state = rootReducer
  // key will become this.props.key and accessible to this component
  // value is a property of the RootReducer which is a reference to the reducer function

  return {
    auth: state.auth,
    cart: state.cart
  };
};

function mapDispatchToProps(dispatch){
  return bindActionCreators(
    {getCart: GetCart},
    dispatch
  );
}
export default connect(mapStateToProps, mapDispatchToProps)(Cart);
