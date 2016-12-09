import {createReducer} from '../utils';
import {
    RECEIVE_PROTECTED_DATA,
    FETCH_PROTECTED_DATA_REQUEST,
    UNAUTHORIZED_REQUEST,
    RESET_DATA_STATUS
} from '../constants';

const initialState = {
    data: null,
    isFetching: false,
    statusText: null,
    route: null
};

export default createReducer(initialState, {
    [RECEIVE_PROTECTED_DATA]: (state, payload) => {
        // returning route so we can toggle display on UI
        return Object.assign({}, state, {
            'data': payload.data,
            'isFetching': false,
            route: payload.route
        });
    },
    [FETCH_PROTECTED_DATA_REQUEST]: (state, payload) => {
        return Object.assign({}, state, {
            'isFetching': true,
            route: null
        });
    },
    [UNAUTHORIZED_REQUEST]: (state, payload) => {
        return Object.assign({}, state, {
            'isFetching': false,
            'statusText': `Authorization Error: ${payload.status} ${payload.statusText} for path: ${payload.route}`,
            route: null
        });
    },
    [RESET_DATA_STATUS]: (state, payload) => {
        return Object.assign({}, state, {
            data: null,
            'isFetching': false,
            'statusText': null,
            route: null
        });
    }
});
