import React from 'react';
import ReactDOM from 'react-dom';
import linkedState from 'react-link';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as actionCreators from '../actions';

export class RegisterView extends React.Component {

    componentDidMount() {
        ReactDOM.findDOMNode(this.refs.usernameInput).focus();
    }

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            admin: false
        };
    }

    register(e) {
        e.preventDefault();
        this.props.actions.registerUser(this.state.username, this.state.password, this.state.admin);
    }

    onCheck (e, checked) {
        this.props.state.admin = checked;
    }


    render() {
        let alertType = this.props.isRegistered ? 'info' : 'danger';
        let alertMessage = this.props.statusText;
        return (
            <div className='col-xs-12 col-md-6 col-md-offset-3'>
                <h3>Register a new account</h3>
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
                               placeholder='Password'/>
                    </div>
                    <div className='checkbox'>
                        <label>
                            <input type='checkbox'
                                   checkedLink={linkedState(this, 'admin')}/>
                            <span>An Admin</span>
                        </label>
                    </div>
                    <button type='submit'
                            className='btn btn-lg'
                            disabled={this.props.isRegistering}
                            onClick={this.register.bind(this)}>Submit
                    </button>
                </form>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isRegistering: state.register.isRegistering,
    statusText: state.register.statusText,
    isRegistered: state.register.isRegistered
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterView);
