import React from 'react';
import '../App';

class QueryPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.state;
    }

    render() {
        return (
            <div className="About">
                <h1>Page for INFO about the prototype</h1>
            </div>
        );
    }
}

export default QueryPage;