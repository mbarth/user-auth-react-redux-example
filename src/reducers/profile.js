/**
 * Created by Marcelo on 2016-12-06.
 */
import {createReducer} from '../utils';
import {
    FETCH_USER_REQUEST,
    RECEIVE_USER_DATA,
    RECEIVE_USER_DATA_FAILURE,
    UPDATE_USER_REQUEST,
    UPDATE_USER_SUCCESS,
    UPDATE_USER_FAILURE,
    RESET_PROFILE
} from '../constants';

const initialState = {
    isFetching: false,
    username: null,
    admin: null,
    isUpdated: false,
    isUpdating: false,
    statusText: null
};

export default createReducer(initialState, {
    [FETCH_USER_REQUEST]: (state, payload) => {
        return Object.assign({}, state, {
            'isFetching': true,
            'statusText': null
        });
    },
    [RECEIVE_USER_DATA]: (state, payload) => {
        return Object.assign({}, state, {
            'username': payload.data.user.username,
            'admin': payload.data.user.admin,
            'isFetching': false,
            'statusText': null
        });
    },
    [RECEIVE_USER_DATA_FAILURE]: (state, payload) => {
        return Object.assign({}, state, {
            'statusText': `Retrieve User Error: ${payload.status} ${payload.statusText}`
        });
    },
    [UPDATE_USER_REQUEST]: (state, payload) => {
        return Object.assign({}, state, {
            'isUpdating': true,
            'statusText': null
        });
    },
    [UPDATE_USER_SUCCESS]: (state, payload) => {
        return Object.assign({}, state, {
            'isUpdating': false,
            'isUpdated': true,
            'admin': payload.admin,
            'username': payload.username,
            'statusText': payload.statusText
        });

    },
    [UPDATE_USER_FAILURE]: (state, payload) => {
        return Object.assign({}, state, {
            'isUpdating': false,
            'isUpdated': false,
            'admin': null,
            'username': null,
            'statusText': `Update Error: ${payload.status} ${payload.statusText}`
        });
    },
    [RESET_PROFILE]: (state, payload) => {
        return Object.assign({}, state, {
            'isUpdating': false,
            'isUpdated': false,
            'admin': null,
            'username': null,
            'statusText': null
        });
    }
});


