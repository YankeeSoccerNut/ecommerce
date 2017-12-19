import React from 'react';


function CartRow(props){

  const p = props.product;  // some shorthand....
  return(
    <tr>
      <td>{p.productName}</td>
      <td>{p.buyPrice}</td>
      <td><button className="btn btn-danger">Delete</button></td>
    </tr>
  );
};

export default CartRow;
