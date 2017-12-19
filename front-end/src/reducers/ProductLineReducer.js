// A reducer is a function that calculates and returns a piece of state

export default function (state=[], action){
  console.log("ProductLineReducer action: \n", action);
  switch (action.type) {
    case 'GET-PRODUCTLINES':
      return action.payload.data
    default:
      return state
  }
};
