/**
 * Created by Marcelo on 2016-12-06.
 */
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actionCreators from '../actions';

export class ProtectedDataView extends React.Component {

    constructor(props) {
        super(props);
        const route = this.props.location.pathname;
        this.state = {
            route: route
        };
    }

    componentWillMount() {
        this.fetchData();
    }

    fetchData() {
        let token = this.props.token;
        let route = this.state.route;
        this.props.actions.fetchProtectedData(token, route);
    }

    render() {
        // using the different routes that were used to toggle alert class
        // to highlight that we received data from different sources based
        // on roles: user vs admin
        let alertType = this.props.route === '/protected' ? 'success' : 'info';
        return (
            <div>
                {this.props.isFetching === true
                    ? <h1>Loading data...</h1>
                    : <div>
                    <h1>Signed in as: {this.props.username}</h1>
                    <div className={'alert alert-' + alertType}>{this.props.data}</div>
                </div>
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    data: state.data.data,
    isFetching: state.data.isFetching,
    route: state.data.route
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ProtectedDataView);
