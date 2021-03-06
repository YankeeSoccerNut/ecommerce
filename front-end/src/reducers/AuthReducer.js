// A reducer is a function that calculates and returns a piece of state

export default function (state=[], action){

  switch (action.type) {
    case 'AUTH-ACTION':
      return action.payload.data
    case 'LOGOUT':
      return [];
    default:
      return state
  }
};
