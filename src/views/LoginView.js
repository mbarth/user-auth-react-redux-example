import React from 'react';
import ReactDOM from 'react-dom';
import linkedState from 'react-link';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as actionCreators from '../actions';
import {Link} from 'react-router';

export class LoginView extends React.Component {

    componentDidMount() {
        if (!this.state.username) {
            ReactDOM.findDOMNode(this.refs.usernameInput).focus();
        } else {
            ReactDOM.findDOMNode(this.refs.passwordInput).focus();
        }
    }

    constructor(props) {
        super(props);
        const redirectRoute = this.props.location.query.next || '/login';
        const username = this.props.username || '';
        this.state = {
            username: username,
            password: '',
            redirectTo: redirectRoute
        };
    }

    login(e) {
        e.preventDefault();
        this.props.actions.loginUser(this.state.username, this.state.password, this.state.redirectTo);
    }

    render() {
        let alertType = this.props.isAuthenticated || this.props.isLoggedOut || this.props.isRegistered ? 'info' : 'danger';
        let alertMessage = this.props.statusText || this.props.registeredStatusText;
        return (
            <div className='col-xs-12 col-md-6 col-md-offset-3'>
                <h3>Log in or <Link to='/register'>Register</Link> new account</h3>
                {alertMessage ? <div className={'alert alert-' + alertType}>{alertMessage}</div> : ''}
                <form role='form'>
                    <div className='form-group'>
                        <input type='text'
                               className='form-control input-lg'
                               valueLink={linkedState(this, 'username')}
                               ref='usernameInput'
                               placeholder='Username'/>
                    </div>
                    <div className='form-group'>
                        <input type='password'
                               className='form-control input-lg'
                               valueLink={linkedState(this, 'password')}
                               ref='passwordInput'
                               placeholder='Password'/>
                    </div>
                    <button type='submit'
                            className='btn btn-lg'
                            disabled={this.props.isAuthenticating}
                            onClick={this.login.bind(this)}>Submit
                    </button>
                </form>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticating: state.auth.isAuthenticating,
    isAuthenticated: state.auth.isAuthenticated,
    statusText: state.auth.statusText,
    isLoggedOut: state.auth.isLoggedOut,
    registeredStatusText: state.register.statusText,
    isRegistered: state.register.isRegistered,
    username: state.register.username
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginView);
