// An Action is a JS function that returns an object that contains at LEAST a property called "type"

import axios from 'axios';

export default function(token){

  let axiosPromise = axios({
    url: `${window.apiHost}/getCart`,
    method: "POST",
    data: { token }
  });

// using promise as payload will cause our middleware to kick in....
// redux-promise won't dispatch the action (inform reducers) until the promise is fulfilled

  return {
    type: "GET-CART",
    payload: axiosPromise
  };
};
