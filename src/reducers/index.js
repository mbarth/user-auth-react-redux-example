import {combineReducers} from 'redux';
import {routerStateReducer} from 'redux-router';
import auth from './auth';
import data from './data';
import register from './register';
import profile from './profile';

export default combineReducers({
    auth,
    data,
    register,
    profile,
    router: routerStateReducer
});
