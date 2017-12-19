// Root Reducer is a reference to all reducers in the app
// It represents ALL of the state that redux manages

// use the combineReducers from redux to pull them all together
import { combineReducers } from 'redux';

import AuthReducer from './AuthReducer';
import ProductLineReducer from './ProductLineReducer';
import CartReducer from './CartReducer';


//combineReducers takes an object as an arg.  key is state name, value is reducer function
const rootReducer = combineReducers({auth: AuthReducer, pl: ProductLineReducer,
cart: CartReducer});

export default rootReducer;
