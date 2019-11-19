import React from 'react';
import '../App';


class LoadBankAccount extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.state;
        console.log(this.state);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        const bank = this.state.value;
        // alert('Your favorite flavor is: ' + this.state.value);
        event.preventDefault();
        if (bank === "deutsche_Bank"){
            window.location.href = 'https://simulator-api.db.com/gw/oidc/authorize?response_type=token&redirect_uri=https://localhost:3000/dashboard&client_id=2a01cbd0-a7a1-405b-88c9-5ecc51e1a7db';
        }
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Choose your bank:
                    <select value={this.state.value} onChange={this.handleChange}>
                        <option value="deutsche_Bank">Deutsche Bank</option>
                        <option value="internal_Sandbox">Internal Sandbox</option>
                    </select>
                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

export default LoadBankAccount;