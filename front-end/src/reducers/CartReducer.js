// A reducer is a function that calculates and returns a piece of state

export default function (state={}, action){
  console.log("UpdateCartReducer action: \n", action);

  switch (action.type) {
    case 'GET-CART':
    case 'UPDATE-CART':
      return action.payload.data
    default:
      return state
  }
};
