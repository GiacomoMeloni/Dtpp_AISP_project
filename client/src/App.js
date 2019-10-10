import React, { Component } from "react";
import BAT_contract from "./contract-builds/BAT.json";
import getWeb3 from "./utils/getWeb3";
import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";

import "./App.css";
import LoadBankAccount from "./Components/Load_Bank_Account";
import About from "./Components/About";
import Home from "./Components/Home";

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            balanceValue: 10,
            address: null,
            web3: null,
            accounts: null,
            contract: null
        };
    }


  // componentDidMount = async () => {
  //   try {
  //     // Get network provider and web3 instance.
  //     const web3 = await getWeb3();
  //     // Use web3 to get the user's accounts.
  //     const accounts = await web3.eth.getAccounts();
  //     // Get the contract instance.
  //     const networkId = await web3.eth.net.getId();
  //     console.log(networkId);
  //     const deployedNetwork = BAT_contract.networks[networkId];
  //     console.log(deployedNetwork);
  //     const instance = new web3.eth.Contract(
  //         BAT_contract.abi, deployedNetwork.address
  //     );
  //     console.log(instance);
  //     // Set web3, accounts, and contract to the state, and then proceed with an
  //     // example of interacting with the contract's methods.
  //     this.setState({ web3, accounts, contract: instance }, this.runExample);
  //   } catch (error) {
  //     // Catch any errors for any of the above operations.
  //     alert(
  //       `Failed to load web3, accounts, or contract. Check console for details.`,
  //     );
  //     console.error(error);
  //   }
  // };
  //
  // runExample = async () => {
  //   const { accounts, contract } = this.state;
  //   console.log(accounts);
  //
  //   // await contract.methods.createBankAccount("Hola",1).send({ from: accounts[0]});
  //   // await contract.methods.SetBankAccountBalance(1,100).send({ from: accounts[0]});
  //
  //   // Get the value from the contract to prove it worked.
  //   const balance = await contract.methods.getAccountBalance(1).call();
  //   const addressOfOwner = await contract.methods.ownerOf(1).call();
  //   console.log(balance);
  //   console.log (await contract.methods.getBankAccount(1));
  //   // Update state with the result.
  //   this.setState({ balanceValue: balance });
  //   this.setState({ address: addressOfOwner });
  // };

  render() {
    // if (!this.state.web3) {
    //   return <div>Loading Web3, accounts, and contract...</div>;
    // }
    return (
        <Router>
          <div className="App">
            <Switch>
              <Route path="/" exact render={(props)=><Home {...props} state = {this.state}/>}/>
              <Route path="/about" exact component={About}/>
              <Route path="/loadBankAccount" component={LoadBankAccount}/>
            </Switch>
            {/*<h1>Welcome to Distrubuted TPP AISP project</h1>*/}
            {/*<p>This prototype has the purpose to show the interaction with smart contracts and banks API</p>*/}
            {/*<h2>Let's see how it works!</h2>*/}

            {/*<p>*/}
            {/*  You now let authorize the transactions through Metamask...*/}
            {/*</p>*/}
            {/*/!*<div>The token of {this.state.address} has balance: {this.state.balanceValue}</div>*!/*/}
          </div>
        </Router>
    );
  }

  // Home = () => (
  //     <div>
  //       <h1>Welcome to Distrubuted TPP AISP project</h1>
  //       <p>This prototype has the purpose to show the interaction with smart contracts and banks API</p>
  //       <h2>Let's see how it works!</h2>
  //
  //       <p>
  //         You now let authorize the transactions through Metamask...
  //       </p>
  //       <div>The token of {this.state.address} has balance: {this.state.balanceValue}</div>
  //     </div>
  // );
}

export default App;
