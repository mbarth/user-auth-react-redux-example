import React from 'react';
import ReactDOM from 'react-dom';
import linkedState from 'react-link';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as actionCreators from '../actions';

/**
 * Issue with redux form first render as described in bug #621:
 * https://github.com/erikras/redux-form/issues/621
 * https://github.com/erikras/redux-form/pull/843
 */
export class ProfileView extends React.Component {

    componentDidMount() {
        this.fetchUser();
        ReactDOM.findDOMNode(this.refs.passwordInput).focus();
    }

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            admin: this.props.admin
        };
    }

    fetchUser() {
        let token = this.props.token;
        this.props.actions.fetchUser(token);
    }

    update(e) {
        e.preventDefault();
        let token = this.props.token;
        this.props.actions.updateUser(token, this.state.password, this.state.admin);
    }

    render() {
        let alertType = this.props.isUpdated ? 'info' : 'danger';
        return (
            <div className='col-xs-12 col-md-6 col-md-offset-3'>
                <h3>User Profile for: {this.props.username}</h3>
                <p>Admin: {String(this.props.admin)}</p>
                {this.props.statusText ? <div className={'alert alert-' + alertType}>{this.props.statusText}</div> : ''}
                {this.props.isFetching === true ? <h1>Loading data...</h1> :
                    <form role='form'>
                        <div className='form-group'>
                            <label>Password and Admin status updates are allowed</label>
                        </div>
                        <div className='form-group'>
                            <input type='password'
                                   className='form-control input-lg'
                                   valueLink={linkedState(this, 'password')}
                                   ref='passwordInput'
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
                                disabled={this.props.isUpdating}
                                onClick={this.update.bind(this)}>Update Profile
                        </button>
                    </form>
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    username: state.profile.username,
    admin: state.profile.admin,
    isUpdating: state.profile.isUpdating,
    statusText: state.profile.statusText,
    isUpdated: state.profile.isUpdated
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
