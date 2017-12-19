import React from 'react';


function ProductRow(props){

  const p = props.product;  // some shorthand....
  let inStockClass = "";
  let inStockMsg = "";
  let button = "";
  
  if (props.token === undefined){
    button = "";
  } else {
    button = <button onClick={()=>{
      props.addToCart(props.token, props.product.productCode)}} className="btn btn-primary">Add to Cart</button>
  };

  if (p.quantityInStock > 100){
    inStockMsg = "In Stock";
  }
  else if (p.quantityInStock > 0){
    inStockClass = "bg-warning";
    inStockMsg = "Order soon!";
  } else {
    inStockClass = "bg-danger";
    inStockMsg = "Sorry! Out of stock.";
  };

  return (
    <tr>
      <td>{p.productName}</td>
      <td>{p.productScale}</td>
      <td>{p.productVendor}</td>
      <td>{p.productDescription}</td>
      <td className={inStockClass}>{inStockMsg}</td>
      <td>{p.buyPrice}</td>
      <td>{p.MSRP}</td>
      {/* pass a function */}
      <td>{button}</td>
    </tr>
  )
};

export default ProductRow;
