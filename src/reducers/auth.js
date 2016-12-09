import {createReducer} from '../utils';
import {LOGIN_USER_REQUEST, LOGIN_USER_SUCCESS, LOGIN_USER_FAILURE, LOGOUT_USER, RESET_LOGIN, UPDATE_AUTH_TOKEN} from '../constants';
import jwtDecode from 'jwt-decode';

const initialState = {
    token: null,
    username: null,
    admin: null,
    isAuthenticated: false,
    isAuthenticating: false,
    isLoggedOut: false,
    statusText: null
};

export default createReducer(initialState, {
    [LOGIN_USER_REQUEST]: (state, payload) => {
        return Object.assign({}, state, {
            'isAuthenticating': true,
            'statusText': null,
            'isLoggedOut': false
        });
    },
    [LOGIN_USER_SUCCESS]: (state, payload) => {
        return Object.assign({}, state, {
            'isAuthenticating': false,
            'isAuthenticated': true,
            'token': payload.token,
            'admin': jwtDecode(payload.token).admin,
            'username': jwtDecode(payload.token).username,
            'statusText': 'You have been successfully logged in.',
            'isLoggedOut': false
        });

    },
    [LOGIN_USER_FAILURE]: (state, payload) => {
        return Object.assign({}, state, {
            'isAuthenticating': false,
            'isAuthenticated': false,
            'token': null,
            'admin': null,
            'username': null,
            'statusText': `Authentication Error: ${payload.status} ${payload.statusText}`,
            'isLoggedOut': false
        });
    },
    [LOGOUT_USER]: (state, payload) => {
        return Object.assign({}, state, {
            'isAuthenticated': false,
            'token': null,
            'admin': null,
            'username': null,
            'statusText': 'You have been successfully logged out.',
            'isLoggedOut': true
        });
    },
    [RESET_LOGIN]: (state, payload) => {
        return Object.assign({}, state, {
            'token': null,
            'username': null,
            'admin': null,
            'isAuthenticated': false,
            'isAuthenticating': false,
            'isLoggedOut': false,
            'statusText': null
        });
    },
    [UPDATE_AUTH_TOKEN]: (state, payload) => {
        return Object.assign({}, state, {
            'token': payload.token,
            'username': payload.username,
            'admin': payload.admin,
        });
    }
});
