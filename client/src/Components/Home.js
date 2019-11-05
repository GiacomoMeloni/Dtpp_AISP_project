import React from 'react';
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
            console.log("I am here!");
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            console.log(networkId);
            const deployedNetwork = BAT_contract.networks[networkId];
            console.log(deployedNetwork);
            const instance = new web3.eth.Contract(
                BAT_contract.abi, deployedNetwork.address
            );
            console.log(instance);
            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            this.setState({ web3, accounts, contract: instance }, this.runExample);
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };
    //
    runExample = async () => {
        const { accounts, contract } = this.state;
        console.log(accounts);
        // Stores a given value, 5 by default.
        await contract.methods.createBankAccount("Hola",1).send({ from: accounts[0]});
        await contract.methods.SetBankAccountBalance(2,100).send({ from: accounts[0]});

        // Get the value from the contract to prove it worked.
        const balance = await contract.methods.getAccountBalance(2).call();
        const addressOfOwner = await contract.methods.ownerOf(2).call();
        console.log(balance);
        console.log (await contract.methods.getBankAccount(1));
        // Update state with the result.
        this.setState({ balanceValue: balance });
        this.setState({ address: addressOfOwner });
    };

    render() {
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        return (
            <div>
                <h1>Welcome to Distrubuted TPP AISP project</h1>
                <p>This prototype has the purpose to show the interaction with smart contracts and banks API</p>
                <h2>Let's see how it works!</h2>

                <p>
                    You now let authorize the transactions through Metamask...
                </p>
                <div>The token of {this.state.address} has balance: {this.state.balanceValue}</div>
            </div>
        );
    }
}

export default Home;