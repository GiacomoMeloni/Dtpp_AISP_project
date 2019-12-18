import React from 'react';

import "../App.css";
import '../App';
import getWeb3 from "../utils/getWeb3";
import BAT_contract from "../contract-builds/BAT";


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
                        <h1>Welcome to Distrubuted AISP project</h1>

                        <h2>Your current address is:</h2>
                        <h1>{this.state.address}</h1>

                        <p>Please click "Enter" to display your Dashboard</p>
                    </div>
                    <div>
                        <button className="button button1" onClick={()=> {window.location.href = '/dashboard';}}>Enter</button>
                    </div>
                </div>
        );
    }
}

export default Home;