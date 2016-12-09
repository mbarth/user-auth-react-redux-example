import React from "react";

export function hostAndPort() {
    return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
}

export function createConstants(...constants) {
    return constants.reduce((acc, constant) => {
        acc[constant] = constant;
        return acc;
    }, {});
}

export function createReducer(initialState, reducerMap) {
    return (state = initialState, action) => {
        const reducer = reducerMap[action.type];

        return reducer
            ? reducer(state, action.payload)
            : state;
    };
}

export function checkHttpStatus(response) {
    // TODO update checkHttpStatus
    // if (response.status >= 200 && response.status < 300) {
    if (response.ok) {
        return response
    } else {
        var error = new Error(response.statusText)
        error.response = response
        throw error
    }
}

export function parseJSON(response) {
    return response.json()
}
