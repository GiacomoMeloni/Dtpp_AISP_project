import React from 'react';
import {Link} from 'react-router-dom';
import '../App';
import getWeb3 from "../utils/getWeb3";
import BAT_contract from "../contract-builds/BAT";
import QueryPage from "./Query";


class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.state;
        console.log(this.state);
        console.log(props);
    }

    componentDidMount = async () => {
        try {
            console.log("I am here!");
            // Get network provider and web3 instance.
            this.state.web3 = await getWeb3();
            // Use web3 to get the user's accounts.
            const account = (await this.state.web3.eth.getAccounts())[0];
            this.setState({ address: account });
            console.log(this.state.address);
            // Get the contract instance.
            const networkId = await this.state.web3.eth.net.getId();
            console.log(networkId);
            const deployedNetwork = BAT_contract.networks[networkId];
            this.setState({instance : new this.state.web3.eth.Contract(
                    BAT_contract.abi, deployedNetwork.address
                )});
            console.log(this.state.instance);
            console.log("lista accounts");
            // console.log(this.state.web3.accounts[0]);

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            // this.setState({ web3, accounts, contract: instance }, this.runExample);
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
        }
    };
    //
    // runExample = async () => {
    //     const { accounts, contract } = this.state;
    //     console.log(accounts);
    //     // Stores a given value, 5 by default.
    //     await contract.methods.createBankAccount("Hola",1).send({ from: accounts[0]});
    //     await contract.methods.SetBankAccountBalance(2,100).send({ from: accounts[0]});
    //
    //     // Get the value from the contract to prove it worked.
    //     const balance = await contract.methods.getAccountBalance(2).call();
    //     const addressOfOwner = await contract.methods.ownerOf(2).call();
    //     console.log(balance);
    //     console.log (await contract.methods.getBankAccount(1));
    //     // Update state with the result.
    //     this.setState({ balanceValue: balance });
    //     this.setState({ address: addressOfOwner });
    // };

    routeChange() {
        let path = '/loadBankAccount';
        this.history.pushState(null, path);
    }

    render() {
        return (
                <div>
                    <div>
                        <h1>Welcome to Distrubuted TPP AISP project</h1>
                        <p>Please select the current Ethereum Address from Metamask and the select the API to connect with from the list below</p>

                        <h2>Your current address is:</h2>
                        <h1>{this.state.address}</h1>

                        <p>
                            You have to authorize the transactions through Metamask...
                        </p>
                        {/*<div>The token of {this.state.address} has balance: {this.state.balanceValue}</div>*/}
                    </div>
                    <div>
                        {/*<Router>*/}
                            <Link to="/loadBankAccount" render={(props)=><QueryPage {...props} state = {this.state}/>}>Load Bank Account </Link>
                        {/*</Router>*/}
                    </div>
                </div>
        );
    }
}

export default Home;