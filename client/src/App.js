import React, { Component } from "react";
import BAT_contract from "./contracts/BAT.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
  state = { balanceValue: 10,address: null, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      const deployedNetwork = BAT_contract.networks["5777"];
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

  runExample = async () => {
    const { accounts, contract } = this.state;
    console.log(accounts);
    // Stores a given value, 5 by default.
    await contract.methods.createBankAccount("Hola",1).send({ from: accounts[0]});
    await contract.methods.SetBankAccountBalance(1,100).send({ from: accounts[0]});

    // Get the value from the contract to prove it worked.
    const balance = await contract.methods.getAccountBalance(1).call();
    const addressOfOwner = await contract.methods.ownerOf(1).call();
    console.log(balance);
    // Update state with the result.
    this.setState({ balanceValue: balance });
    this.setState({ address: addressOfOwner });
  };


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <div>The token of {this.state.address} has balance: {this.state.balanceValue}</div>
      </div>
    );
  }
}

export default App;
