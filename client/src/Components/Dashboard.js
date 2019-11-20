import React from 'react';
import {Link} from 'react-router-dom';
import getWeb3 from "../utils/getWeb3";
import BAT_contract from "../contract-builds/BAT";
import BAT_Token from "./BAT_Token";

const axios = require('axios').default;


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: null,
            web3: null,
            instance: null,
            value: 'deutsche_Bank',
            bat: [],
            token: null
        };

        if(window.location.href != "https://localhost:3000/dashboard") {
            this.state.token = (window.location.hash.split('=', 2)[1]).split('&', 1);
            console.log(this.state.token);
        }
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
            window.location.href = 'https://simulator-api.db.com/gw/oidc/authorize?response_type=token&redirect_uri=https://localhost:3000/queryPage&client_id=2a01cbd0-a7a1-405b-88c9-5ecc51e1a7db';
        }
    }


    laodWeb3 = async () => {
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
            this.getBATToken();
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
        }
    };

    async componentDidMount (){
        this.laodWeb3();
    }

    async getBATToken() {
        console.log(1);
        var tokens = new Array();
        await this.state.instance.methods.getAllTokenByOwnerAddress(this.state.address).call().then(async (response) => {
            for (const id of response){
                if (id!=0){
                    tokens.push(await this.state.instance.methods.getBankAccount(id).call());
                }
            }
            this.setState({bat: tokens});
            this.state.overallBalance =  await this.state.instance.methods.getOverallBalance(this.state.address).call();
            console.log(this.state.bat);
            console.log(this.state.overallBalance);
        });
    }

    // async getCashAccounts(){
    //     await axios.get("https://simulator-api.db.com:443/gw/dbapi/banking/cashAccounts/v2/?limit=10&offset=0",
    //             {headers: {Authorization: "Bearer "+this.state.token}}).then(async (response) => {
    //                      const accounts = response.data.accounts;
    //                      for (const element of accounts) {
    //                          await this.state.instance.methods.createBankAccount(element.iban,1).send({ from: this.state.address});
    //                          const idToken = await this.state.instance.methods.returnIdGivenIBAN(element.iban).call();
    //                          await this.state.instance.methods.SetBankAccountBalance(idToken, parseInt(element.currentBalance * 100,10)).send({ from: this.state.address});
    //                          const bankAccount = await this.state.instance.methods.getBankAccount(idToken).call();
    //                          console.log(element);
    //                          console.log(bankAccount);
    //                      }
    //              });
    // }

    render() {
        // this.checkTokenExist();
        return (
            <div>
                <div>
                    <h1>Welcome to Dashboard</h1>
                </div>

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
            </div>
        );
    }
}

export default Dashboard;