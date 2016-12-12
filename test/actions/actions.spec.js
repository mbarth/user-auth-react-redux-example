import expect from 'expect';
import React from 'react';
import * as TYPES from '../../src/constants';
import * as ACTIONS from '../../src/actions';
import {mockStore} from '../mockStore';
import nock from 'nock';

(function (glob) {
    function mockStorage() {
        var storage = {};
        return {
            setItem: function (key, value) {
                storage[key] = value || '';
            },
            getItem: function (key) {
                return storage[key];
            },
            removeItem: function (key) {
                delete storage[key];
            },
            get length() {
                return Object.keys(storage).length;
            },
            key: function (i) {
                var keys = Object.keys(storage);
                return keys[i] || null;
            }
        };
    }

    glob.localStorage = mockStorage();
    glob.sessionStorage = mockStorage();
    glob.port = 3002;
    global.location = {protocol: 'http:', hostname: 'localhost', port: glob.port};

}(typeof window !== 'undefined' ? window : global));

describe('actions:', () => {

    afterEach(() => {
        nock.cleanAll();
    })

    beforeEach(() => {
        localStorage.removeItem('token');
    })

    it('loginUserSuccess should create LOGIN_USER_SUCCESS action', () => {
        expect(ACTIONS.loginUserSuccess('token')).toEqual({
            type: TYPES.LOGIN_USER_SUCCESS, payload: {
                token: 'token'
            }
        })

    })

    it('loginUserFailure should create LOGIN_USER_FAILURE action', () => {
        expect(ACTIONS.loginUserFailure(401, 'User not found.')).toEqual({
            type: TYPES.LOGIN_USER_FAILURE, payload: {
                status: 401,
                statusText: 'User not found.'
            }
        })
    })

    it('loginUserRequest should create LOGIN_USER_REQUEST action', () => {
        expect(ACTIONS.loginUserRequest()).toEqual({type: TYPES.LOGIN_USER_REQUEST})
    })

    it('logout should create LOGOUT_USER action', () => {
        expect(ACTIONS.logout()).toEqual({type: TYPES.LOGOUT_USER})
    })

    it('receiveProtectedData should create RECEIVE_PROTECTED_DATA action', () => {
        expect(ACTIONS.receiveProtectedData('data', '/protected')).toEqual({
            type: TYPES.RECEIVE_PROTECTED_DATA, payload: {
                data: 'data',
                route: '/protected'
            }
        })
    })

    it('fetchProtectedDataRequest should create FETCH_PROTECTED_DATA_REQUEST action', () => {
        expect(ACTIONS.fetchProtectedDataRequest()).toEqual({type: TYPES.FETCH_PROTECTED_DATA_REQUEST})
    })

    it('logoutAndRedirect should create logout and pushState actions', (done) => {
        const expectedActions = [
            {
                type: TYPES.LOGOUT_USER
            }, {
                type: '@@reduxReactRouter/historyAPI',
                payload: {
                    method: 'pushState',
                    args: [
                        null, '/login'
                    ]
                }
            }
        ]
        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.logoutAndRedirect());
    })

    it('fetchProtectedDataRequest should create login and pushState actions when API returns 401', (done) => {
        const expectedActions = [
            {
                type: TYPES.FETCH_PROTECTED_DATA_REQUEST
            }, {
                type: TYPES.LOGIN_USER_FAILURE,
                payload: {
                    status: 401,
                    statusText: 'Unauthorized'
                }
            }, {
                type: '@@reduxReactRouter/historyAPI',
                payload: {
                    method: 'pushState',
                    args: [
                        null, '/login'
                    ]
                }
            }
        ]

        nock('http://localhost:' + port)
            .get('/api/protected')
            .reply(401)

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.fetchProtectedData('token', '/protected'));
    })

    it('fetchProtectedDataRequest should create RECEIVE_PROTECTED_DATA actions when API returns 200', (done) => {

        const expectedActions = [
            {
                type: TYPES.FETCH_PROTECTED_DATA_REQUEST
            }, {
                type: TYPES.RESET_DATA_STATUS
            }, {
                type: TYPES.RECEIVE_PROTECTED_DATA,
                payload: {
                    data: 'data',
                    route: '/protected'
                }
            }
        ]

        nock('http://localhost:' + port)
            .get('/api/protected')
            .reply(200, {message: 'data'})

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.fetchProtectedData('token', '/protected'));
    })

    it('fetchProtectedDataRequest ADMIN should create RECEIVE_PROTECTED_DATA actions when API returns 200', (done) => {

        const expectedActions = [
            {
                type: TYPES.FETCH_PROTECTED_DATA_REQUEST
            }, {
                type: TYPES.RESET_DATA_STATUS
            }, {
                type: TYPES.RECEIVE_PROTECTED_DATA,
                payload: {
                    data: 'data',
                    route: '/admin/protected'
                }
            }
        ]

        nock('http://localhost:' + port)
            .get('/api/admin/protected')
            .reply(200, {message: 'data'})

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.fetchProtectedData('token', '/admin/protected'));
    })

    it('loginUser should create LOGIN_USER_REQUEST, RESET_REGISTER, LOGIN_USER_SUCCESS, and PUSH_STATE actions when API returns 200', (done) => {

        let redirect = '/';

        const expectedActions = [
            {
                type: TYPES.LOGIN_USER_REQUEST
            }, {
                type: TYPES.RESET_REGISTER
            }, {
                type: TYPES.LOGIN_USER_SUCCESS,
                payload: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IlRlc3QgVXNlciJ9.J6n4-v0I85zk9MkxBHroZ9ZPZEES-IKeul9ozxYnoZ8'
                }
            }, {
                type: '@@reduxReactRouter/historyAPI',
                payload: {
                    method: 'pushState',
                    args: [
                        null, '/'
                    ]
                }
            }
        ]

        nock('http://localhost:' + port)
            .post('/api/authenticate')
            .reply(200, {token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IlRlc3QgVXNlciJ9.J6n4-v0I85zk9MkxBHroZ9ZPZEES-IKeul9ozxYnoZ8'})

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.loginUser('username', 'password', redirect));
    })

    it('loginUser should create LOGIN_USER_REQUEST, RESET_REGISTER, and LOGIN_USER_FAILURE actions when API returns 401', (done) => {
        let redirect = '/';
        const expectedActions = [
            {
                type: TYPES.LOGIN_USER_REQUEST
            }, {
                type: TYPES.RESET_REGISTER
            }, {
                type: TYPES.LOGIN_USER_FAILURE,
                payload: {
                    status: 401,
                    statusText: 'Unauthorized'
                }
            }
        ]

        nock('http://localhost:' + port)
            .post('/api/authenticate')
            .reply(401, {success: false, message: 'Unauthorized'})

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.loginUser('username', 'password', redirect));
    })

    it('registerUser should create RESET_LOGIN, REGISTER_REQUEST, REGISTER_USER_SUCCESS, and RESET_DATA_STATUS actions when API returns 200', (done) => {
        let isAdmin = true;
        const expectedActions = [
            {
                type: TYPES.RESET_LOGIN
            }, {
                type: TYPES.REGISTER_REQUEST
            }, {
                type: TYPES.REGISTER_USER_SUCCESS,
                payload: {
                    status: 200,
                    statusText: 'User successfully added.',
                    username: 'username',
                    admin: isAdmin
                }
            }, {
                type: TYPES.RESET_DATA_STATUS
            }, {
                type: '@@reduxReactRouter/historyAPI',
                payload: {
                    method: 'pushState',
                    args: [
                        null, '/login'
                    ]
                }
            }
        ]

        nock('http://localhost:' + port)
            .post('/register')
            .reply(200, {
                    success: true,
                    message: 'User successfully added.',
                    user: {username: 'username', admin: isAdmin}
                }
            )

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.registerUser('username', 'password', isAdmin));
    })

    it('updateUser should create UPDATE_USER_REQUEST, UPDATE_AUTH_TOKEN, RESET_DATA_STATUS, and UPDATE_USER_SUCCESS actions when API returns 200', (done) => {
        let isAdmin = true;
        let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU4NGRkNTQwNjkzOTQ3MGE3NGU5MGQ4MCIsInVzZXJuYW1lIjoiYWFhIiwiYWRtaW4iOnRydWUsImlhdCI6MTQ4MTUwMjI5MSwiZXhwIjoxNDgxNTg4NjkxfQ.PbFUGOHru0JkjO72GbphWXygn5ukl9qtk88UsMZjKXI'
        const expectedActions = [
            {
                type: TYPES.UPDATE_USER_REQUEST
            }, {
                type: TYPES.UPDATE_AUTH_TOKEN,
                payload: {
                    token: token,
                    username: 'username',
                    admin: isAdmin
                }
            }, {
                type: TYPES.RESET_DATA_STATUS
            }
            , {
                type: TYPES.UPDATE_USER_SUCCESS,
                payload: {
                    status: 200,
                    statusText: 'User successfully updated.',
                    username: 'username',
                    admin: isAdmin
                }
            }
        ]

        nock('http://localhost:' + port, {
            reqheaders: {
                'x-access-token': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'cache-control': 'no-cache'
            }
        }).put('/api/user/584dd5406939470a74e90d80',
            {password: 'password', admin: isAdmin})
            .reply(200, {
                    success: true,
                    message: 'User successfully updated.',
                    user: {username: 'username', admin: isAdmin},
                    token: token
                }
            )

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.updateUser(token, 'password', isAdmin));
    })

    it('updateUser should create UPDATE_USER_REQUEST, and UPDATE_USER_FAILURE actions when API returns 400', (done) => {
        let isAdmin = true;
        let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU4NGRkNTQwNjkzOTQ3MGE3NGU5MGQ4MCIsInVzZXJuYW1lIjoiYWFhIiwiYWRtaW4iOnRydWUsImlhdCI6MTQ4MTUwMjI5MSwiZXhwIjoxNDgxNTg4NjkxfQ.PbFUGOHru0JkjO72GbphWXygn5ukl9qtk88UsMZjKXI'
        const expectedActions = [
            {
                type: TYPES.UPDATE_USER_REQUEST
            }, {
                type: TYPES.UPDATE_USER_FAILURE,
                payload: {
                    status: 400,
                    statusText: 'User update failed. Missing password parameter'
                }
            }
        ]

        nock('http://localhost:' + port, {
            reqheaders: {
                'x-access-token': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'cache-control': 'no-cache'
            }
        }).put('/api/user/584dd5406939470a74e90d80', {password: null, admin: isAdmin})
            .reply(400, {
                    success: false,
                    message: 'User update failed. Missing password parameter'
                }
            )

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.updateUser(token, null, isAdmin));
    })

    it('fetchUser should create FETCH_USER_REQUEST, and RECEIVE_USER_DATA actions when API returns 200', (done) => {
        let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU4NGRkNTQwNjkzOTQ3MGE3NGU5MGQ4MCIsInVzZXJuYW1lIjoiYWFhIiwiYWRtaW4iOnRydWUsImlhdCI6MTQ4MTUwMjI5MSwiZXhwIjoxNDgxNTg4NjkxfQ.PbFUGOHru0JkjO72GbphWXygn5ukl9qtk88UsMZjKXI'
        const expectedActions = [
            {
                type: TYPES.FETCH_USER_REQUEST
            }, {
                type: TYPES.RECEIVE_USER_DATA,
                payload: {
                    data: {data: {user: {username: 'username', admin: true}}}
                }
            }
        ]

        nock('http://localhost:' + port)
            .get('/api/user/584dd5406939470a74e90d80')
            .reply(200, {data: {user: {username: 'username', admin: true}}})

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.fetchUser(token));
    })

    it('fetchUser should create FETCH_USER_REQUEST, and RECEIVE_USER_DATA_FAILURE actions when API returns 404', (done) => {
        let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU4NGRkNTQwNjkzOTQ3MGE3NGU5MGQ4MCIsInVzZXJuYW1lIjoiYWFhIiwiYWRtaW4iOnRydWUsImlhdCI6MTQ4MTUwMjI5MSwiZXhwIjoxNDgxNTg4NjkxfQ.PbFUGOHru0JkjO72GbphWXygn5ukl9qtk88UsMZjKXI'
        const expectedActions = [
            {
                type: TYPES.FETCH_USER_REQUEST
            }, {
                type: TYPES.RECEIVE_USER_DATA_FAILURE,
                payload: {
                    status: 404,
                    statusText: 'Not Found'
                }
            }
        ]

        nock('http://localhost:' + port)
            .get('/api/user/584dd5406939470a74e90d80')
            .reply(404, {
                success: false,
                message: 'User not found.'
            })

        const store = mockStore({}, expectedActions, done);
        store.dispatch(ACTIONS.fetchUser(token));
    })

})