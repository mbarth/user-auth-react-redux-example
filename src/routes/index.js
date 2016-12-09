import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {App} from '../containers';
import {HomeView, LoginView, ProtectedDataView, RegisterView, ProfileView} from '../views';
import {requireAuthentication} from '../components/AuthenticatedComponent';

export default(
    <Route path='/' component={App}>
        <IndexRoute component={HomeView}/>
        <Route path="login" component={LoginView}/>
        <Route path="admin/protected" component={requireAuthentication(ProtectedDataView)}/>
        <Route path="protected" component={requireAuthentication(ProtectedDataView)}/>
        <Route path="register" component={RegisterView}/>
        <Route path="profile" component={requireAuthentication(ProfileView)}/>
    </Route>
);
