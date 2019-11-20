import React, { Component } from "react";
// import BAT_contract from "./contract-builds/BAT.json";
// import getWeb3 from "./utils/getWeb3";
import {BrowserRouter as Router, Switch, Route, /*Link*/} from "react-router-dom";

import "./App.css";
import LoadBankAccount from "./Components/Load_Bank_Account";
import About from "./Components/About";
import Home from "./Components/Home";
import QueryPage from "./Components/Query";
import Dashboard from "./Components/Dashboard";
import getWeb3 from "./utils/getWeb3";
import BAT_contract from "./contract-builds/BAT";

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            queryDone: false,
            address: null,
            web3: null,
            instance: null,
            value: 'deutsche_Bank',
            token: null,
            bat: [],
            overallBalance: 0,

        };
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
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
        }
    };

  render() {
    return (
        <Router>
          <div className="App">
            <Switch>
              <Route path="/" exact render={(props)=><Home {...props} state = {this.state}/>}/>
              <Route path="/about" exact component={About}/>
              <Route path="/loadBankAccount" exact render={(props)=><LoadBankAccount {...props} state = {this.state}/>}/>
              <Route path="/queryPage" render={(props)=><QueryPage {...props} state = {this.state}/>}/>
              <Route path="/dashboard" render={(props)=><Dashboard {...props} state = {this.state}/>}/>
            </Switch>
          </div>
        </Router>
    );
  }
}

export default App;
