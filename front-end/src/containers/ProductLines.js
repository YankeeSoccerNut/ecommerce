import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { bindActionCreators } from 'redux';
import UpdateCart from '../actions/UpdateCart';

import ProductRow from '../components/ProductRow'
class ProductLines extends Component{

  constructor(){
    super();
    this.state = {
      productList: []
    }
    this.getProducts = this.getProducts.bind(this);
  };

  componentDidMount(){
    //moved guts to get getProducts
    this.getProducts(this.props);
  };

  componentWillReceiveProps(newProps){
    this.getProducts(newProps);
  };

  getProducts(props){
    const pl = props.match.params.productLine;
    const url = `${window.apiHost}/productlines/${pl}/get`;

    axios.get(url)
    .then((response)=>{
      console.log(response);
      this.setState({productList: response.data});
    });
  };

  render(){
    console.log("***********RENDER PRODUCT LIST************");
    console.log(this.state.productList);

    const products = this.state.productList.map((product, index)=>{
      return (
        <ProductRow
          key={index}
          product={product}
          addToCart={this.props.updateCart}
          token={this.props.auth.token}
        />
      );
    });

    return (
      <div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="table-head">Product Name</th>
              <th className="table-head">Model Scale</th>
              <th className="table-head">Made By</th>
              <th className="table-head">Description</th>
              <th className="table-head">In Stock</th>
              <th className="table-head">Your Price</th>
              <th className="table-head">MSRP</th>
            </tr>
          </thead>
          <tbody>
            {products}
          </tbody>
        </table>
      </div>
    );
  };
};

function mapStateToProps(state){
  return{
    pl: state.pl,
    auth: state.auth
  };
};

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    updateCart: UpdateCart
    }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(ProductLines);
