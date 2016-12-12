import {createConstants} from '../utils';

export default createConstants(
    'LOGIN_USER_REQUEST',
    'LOGIN_USER_FAILURE',
    'LOGIN_USER_SUCCESS',
    'LOGOUT_USER',
    'RESET_LOGIN',
    'FETCH_PROTECTED_DATA_REQUEST',
    'RECEIVE_PROTECTED_DATA',
    'UNAUTHORIZED_REQUEST',
    'RESET_DATA_STATUS',
    'REGISTER_REQUEST',
    'REGISTER_USER_SUCCESS',
    'REGISTER_USER_FAILURE',
    'RESET_REGISTER',
    'FETCH_USER_REQUEST',
    'RECEIVE_USER_DATA',
    'RECEIVE_USER_DATA_FAILURE',
    'UPDATE_USER_REQUEST',
    'UPDATE_USER_SUCCESS',
    'UPDATE_USER_FAILURE',
    'RESET_PROFILE',
    'UPDATE_AUTH_TOKEN'
);
