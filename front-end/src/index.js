import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import Student from './Student';

import { createStore, applyMiddleware } from 'redux';

import RootReducer from './reducers/RootReducer';
import reduxPromise from 'redux-promise';

ReactDOM.render(
	<App />,
	document.getElementById('root'
));
