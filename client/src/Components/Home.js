import React from 'react';
import {Link} from 'react-router-dom';
import {BrowserRouter as Router, Switch, Route, /*Link*/} from "react-router-dom";

import "../App.css";
import '../App';
import getWeb3 from "../utils/getWeb3";
import BAT_contract from "../contract-builds/BAT";
// import QueryPage from "./Query";
import Dashboard from "./Dashboard";


class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.state;
        console.log(this.state);
        console.log(props);
    }

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            this.state.web3 = await getWeb3();
            // Use web3 to get the user's accounts.
            const account = (await this.state.web3.eth.getAccounts())[0];
            this.setState({ address: account });
            // Get the contract instance.
            const networkId = await this.state.web3.eth.net.getId();

            const deployedNetwork = BAT_contract.networks[networkId];
            this.setState({instance : new this.state.web3.eth.Contract(
                    BAT_contract.abi, deployedNetwork.address
                )});
            console.log(this.state);
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
        }
    };

    render() {
        return (
                <div className="homeStyle">
                    <div>
                        <h1>Welcome to Distrubuted TPP AISP project</h1>
                        <p>Please select an Ethereum Address from Metamask and then select the API to connect with from the list below</p>

                        <h2>Your current address is:</h2>
                        <h1>{this.state.address}</h1>

                        <p>
                            You have to authorize the transactions through Metamask...
                        </p>
                        {/*<div>The token of {this.state.address} has balance: {this.state.balanceValue}</div>*/}
                    </div>
                    <div>
                        <button className="button button1" onClick={()=> {window.location.href = '/dashboard';}}>Accedi</button>
                    </div>
                </div>
        );
    }
}

export default Home;