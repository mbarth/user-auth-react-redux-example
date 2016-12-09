/**
 * Created by Marcelo on 2016-12-06.
 */
import {createReducer} from '../utils';
import {REGISTER_USER_REQUEST, REGISTER_USER_SUCCESS, REGISTER_USER_FAILURE, RESET_REGISTER} from '../constants';

const initialState = {
    username: null,
    admin: null,
    isRegistered: false,
    isRegistering: false,
    statusText: null
};

export default createReducer(initialState, {
    [REGISTER_USER_REQUEST]: (state, payload) => {
        return Object.assign({}, state, {
            'isRegistering': true,
            'statusText': null
        });
    },
    [REGISTER_USER_SUCCESS]: (state, payload) => {
        return Object.assign({}, state, {
            'isRegistering': false,
            'isRegistered': true,
            'admin': payload.admin,
            'username': payload.username,
            'statusText': payload.statusText
        });

    },
    [REGISTER_USER_FAILURE]: (state, payload) => {
        return Object.assign({}, state, {
            'isRegistering': false,
            'isRegistered': false,
            'admin': null,
            'username': null,
            'statusText': `Registration Error: ${payload.status} ${payload.statusText}`
        });
    },
    [RESET_REGISTER]: (state, payload) => {
        return Object.assign({}, state, {
            'isRegistering': false,
            'isRegistered': false,
            'admin': null,
            'username': null,
            'statusText': null
        });
    }
});

