// An Action is a JS function that returns an object that contains at LEAST a property called "type"

import axios from 'axios';

export default function(userToken, productCode){

  console.log("UpdateCart is running!!\n");
  console.log(userToken, productCode);


  let axiosPromise = axios({
    url: `${window.apiHost}/updateCart`,
    method: "POST",
    data: { userToken, productCode }  //es6 sets prop=valueVariable
  });

// using promise as payload will cause our middleware to kick in....
// redux-promise won't dispatch the action until the promise is fulfilled (either )
  return {
    type: "UPDATE-CART",
    payload: axiosPromise
  };

};
