import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

export default class HomeView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <h1>React Redux Auth Example</h1>
                <p>Attempt to access some <Link to='/admin/protected'>admin protected data.</Link></p>
                <p>Attempt to access some <Link to='/protected'>user protected data.</Link></p>
                {this.props.statusText ? <div className='alert alert-danger'>{this.props.statusText}</div> : ''}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    statusText: state.data.statusText
});

export default connect(mapStateToProps)(HomeView);