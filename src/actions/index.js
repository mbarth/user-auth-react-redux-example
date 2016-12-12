import {checkHttpStatus, parseJSON} from '../utils';
import {
    LOGIN_USER_REQUEST,
    LOGIN_USER_FAILURE,
    LOGIN_USER_SUCCESS,
    LOGOUT_USER,
    RESET_LOGIN,
    FETCH_PROTECTED_DATA_REQUEST,
    RECEIVE_PROTECTED_DATA,
    UNAUTHORIZED_REQUEST,
    RESET_DATA_STATUS,
    REGISTER_REQUEST,
    REGISTER_USER_SUCCESS,
    REGISTER_USER_FAILURE,
    RESET_REGISTER,
    FETCH_USER_REQUEST,
    RECEIVE_USER_DATA,
    RECEIVE_USER_DATA_FAILURE,
    UPDATE_USER_REQUEST,
    UPDATE_USER_SUCCESS,
    UPDATE_USER_FAILURE,
    RESET_PROFILE,
    UPDATE_AUTH_TOKEN
} from '../constants';
import {hostAndPort} from '../utils';
import {pushState} from 'redux-router';
import jwtDecode from 'jwt-decode';
import fetch from 'isomorphic-fetch';

export function loginUserSuccess(token) {
    localStorage.setItem('token', token);
    return {
        type: LOGIN_USER_SUCCESS,
        payload: {
            token: token
        }
    }
}

export function unauthorizedRequest(error, route) {
    return {
        type: UNAUTHORIZED_REQUEST,
        payload: {
            status: error.response.status,
            statusText: error.response.statusText,
            route: route
        }
    }
}

export function loginUserFailure(status, errorMessage) {
    localStorage.removeItem('token');
    return {
        type: LOGIN_USER_FAILURE,
        payload: {
            status: status,
            statusText: errorMessage
        }
    }
}

export function loginUserRequest() {
    return {
        type: LOGIN_USER_REQUEST
    }
}

export function logout() {
    localStorage.removeItem('token');
    return {
        type: LOGOUT_USER
    }
}

export function logoutAndRedirect() {
    return (dispatch, state) => {
        dispatch(logout());
        dispatch(pushState(null, '/login'));
    }
}

export function loginUser(username, password, redirect = "/") {
    return function (dispatch) {
        dispatch(loginUserRequest());
        dispatch(resetRegisterVariables());
        return fetch(hostAndPort() + '/api/authenticate', {
            method: 'post',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'cache-control': 'no-cache'
            },
            body: JSON.stringify({username: username, password: password})
        }).then(response =>
            response.json().then(json => ({
                    status: response.status,
                    json
                })
            )).then(
            // Both fetching and parsing succeeded!
            ({status, json}) => {
                if (status >= 400) {
                    // Status looks bad
                    dispatch(loginUserFailure(status, json.message));
                } else {
                    // Status looks good
                    dispatch(loginUserSuccess(json.token));
                    dispatch(pushState(null, redirect));
                }
            },
            // Either fetching or parsing failed!
            err => {
                dispatch(loginUserFailure(401, err));
            }
        );
    }
}

export function receiveProtectedData(data, route) {
    return {
        type: RECEIVE_PROTECTED_DATA,
        payload: {
            data: data,
            route: route
        }
    }
}

export function fetchProtectedDataRequest() {
    return {
        type: FETCH_PROTECTED_DATA_REQUEST
    }
}

export function fetchProtectedData(token, route) {
    return (dispatch, state) => {
        dispatch(fetchProtectedDataRequest());
        return fetch(hostAndPort() + '/api' + route, {
            credentials: 'include',
            headers: {
                'x-access-token': token
            }
        })
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(response => {
                dispatch(resetDataStatus());
                dispatch(receiveProtectedData(response.message, route));
            })
            .catch(error => {
                if (error.response.status === 401) {
                    dispatch(loginUserFailure(error.response.status, error.response.statusText));
                    dispatch(pushState(null, '/login'));
                } else if (error.response.status === 403) {
                    dispatch(unauthorizedRequest(error, route));
                    dispatch(pushState(null, '/'));
                }
            })
    }
}

export function resetDataStatus() {
    return {
        type: RESET_DATA_STATUS
    }
}

export function resetLoginVariables() {
    return {
        type: RESET_LOGIN
    }
}

export function resetRegisterVariables() {
    return {
        type: RESET_REGISTER
    }
}

export function registerUserSuccess(status, message, user) {
    localStorage.removeItem('token');
    return {
        type: REGISTER_USER_SUCCESS,
        payload: {
            status: status,
            statusText: message,
            username: user.username,
            admin: user.admin
        }
    }
}

export function registerUserFailure(error, message) {
    localStorage.removeItem('token');
    return {
        type: REGISTER_USER_FAILURE,
        payload: {
            status: error,
            statusText: message
        }
    }
}

export function registerRequest() {
    return {
        type: REGISTER_REQUEST
    }
}

export function registerUser(username, password, admin) {
    let body = JSON.stringify({username: username, password: password, admin: admin});
    return function (dispatch) {
        dispatch(resetLoginVariables());
        dispatch(registerRequest());
        return fetch(hostAndPort() + '/register', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'cache-control': 'no-cache'
            },
            body: body
        }).then(response =>
            response.json().then(json => ({
                    status: response.status,
                    json
                })
            )).then(
            // Both fetching and parsing succeeded!
            ({status, json}) => {
                if (status >= 400) {
                    // Status looks bad
                    dispatch(registerUserFailure(status, json.message));
                } else {
                    // Status looks good
                    dispatch(registerUserSuccess(status, json.message, json.user));
                    dispatch(resetDataStatus());
                    dispatch(pushState(null, '/login'));
                }
            },
            // Either fetching or parsing failed!
            err => {
                dispatch(registerUserFailure(400, err));
            }
        );
    }
}

export function fetchUserRequest() {
    return {
        type: FETCH_USER_REQUEST
    }
}

export function receiveUserData(data) {
    return {
        type: RECEIVE_USER_DATA,
        payload: {
            data: data
        }
    }
}

export function receiveUserDataFailure(status, statusText) {
    return {
        type: RECEIVE_USER_DATA_FAILURE,
        payload: {
            status: status,
            statusText: statusText
        }
    }
}

export function fetchUser(token) {
    let decoded = jwtDecode(token);
    return (dispatch, state) => {
        dispatch(fetchUserRequest());
        return fetch(hostAndPort() + '/api/user/' + decoded.id, {
            credentials: 'include',
            headers: {
                'x-access-token': token
            }
        })
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(response => {
                dispatch(receiveUserData(response));
            })
            .catch(error => {
                dispatch(receiveUserDataFailure(error.response.status, error.response.statusText));
            })
    }
}

export function updateUserFailure(error, message) {
    return {
        type: UPDATE_USER_FAILURE,
        payload: {
            status: error,
            statusText: message
        }
    }
}

export function updateUserSuccess(status, message, user) {

    return {
        type: UPDATE_USER_SUCCESS,
        payload: {
            status: status,
            statusText: message,
            username: user.username,
            admin: user.admin
        }
    }
}

export function updateUserRequest() {
    return {
        type: UPDATE_USER_REQUEST
    }
}

export function updateAuthToken(token, user) {
    localStorage.setItem('token', token);
    return {
        type: UPDATE_AUTH_TOKEN,
        payload: {
            token: token,
            username: user.username,
            admin: user.admin
        }
    }
}

export function updateUser(token, password, admin) {
    let decoded = jwtDecode(token);
    return function (dispatch) {
        dispatch(updateUserRequest());
        return fetch(hostAndPort() + '/api/user/' + decoded.id, {
            method: 'put',
            credentials: 'include',
            headers: {
                'x-access-token': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'cache-control': 'no-cache'
            },
            body: JSON.stringify({password: password, admin: admin})
        }).then(response =>
            response.json().then(json => ({
                    status: response.status,
                    json
                })
            )).then(
            // Both fetching and parsing succeeded!
            ({status, json}) => {
                if (status >= 400) {
                    // Status looks bad
                    dispatch(updateUserFailure(status, json.message));
                } else {
                    // Status looks good
                    dispatch(updateAuthToken(json.token, json.user));
                    dispatch(resetDataStatus());
                    dispatch(updateUserSuccess(status, json.message, json.user));
                }
            },
            // Either fetching or parsing failed!
            err => {
                dispatch(updateUserFailure(400, err));
            }
        );
    }
}

export function resetProfileVariables() {
    return {
        type: RESET_PROFILE
    }
}