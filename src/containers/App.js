import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {logoutAndRedirect} from '../actions';

import '../styles/core.scss';

@connect((state) => {
    return {
        isAuthenticated: state.auth.isAuthenticated
    };
})
export default class CoreLayout extends React.Component {

    render() {

        const {dispatch} = this.props;

        return (
            <div>
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button className="navbar-toggle collapsed"
                                    type="button"
                                    data-toggle="collapse"
                                    data-target="#navbar"
                                    aria-expanded="false"
                                    aria-controls="navbar">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <Link className="navbar-brand" to="/">DX</Link>
                        </div>
                        <div className="collapse navbar-collapse" id="navbar">
                            <ul className="nav navbar-nav navbar-right">
                                <li><Link to="/admin/protected" activeStyle={{ color: 'red' }}>Admin Data</Link></li>
                                <li><Link to="/protected" activeStyle={{ color: 'red' }}>User Data</Link></li>
                                {this.props.isAuthenticated ? <li><Link to="/profile" activeStyle={{ color: 'red' }}>Profile</Link></li> : ''}
                                {!this.props.isAuthenticated ? <li><Link to="/register" activeStyle={{ color: 'red' }}>Register</Link></li> : ''}
                                {!this.props.isAuthenticated ? <li><Link to="/login" activeStyle={{ color: 'red' }}>Login</Link></li> : ''}
                                {this.props.isAuthenticated ?
                                    <li><a href='#' onClick={() => this.props.dispatch(logoutAndRedirect())}>Logout</a>
                                    </li>
                                    : ''}
                            </ul>
                        </div>
                    </div>
                </nav>
                <div className='container'>
                    <div className='row'>
                        <div className='col-xs-12'>
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}