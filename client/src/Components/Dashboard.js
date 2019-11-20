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
            overallBalance: 0,
            bat: [],
            token: null
        };

        if(window.location.href != "https://localhost:3000/dashboard") {
            this.state.token = (window.location.hash.split('=', 2)[1]).split('&', 1);
            console.log(this.state.token);
        }
        // this.laodWeb3();

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

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return true;
    }

    async componentWillMount (){
        this.laodWeb3();
    }

    async getBATToken() {
        var tokens = new Array();
        await this.state.instance.methods.getAllTokenByOwnerAddress(this.state.address).call().then(async (response) => {
            for (const id of response){
                if (id!=0){
                    tokens.push(await this.state.instance.methods.getBankAccount(id).call());
                }
            }
            this.setState({bat: tokens});
            const overallBalance = await this.state.instance.methods.getOverallBalance(this.state.address).call();
            this.setState({overallBalance: overallBalance});
            console.log(this.state.bat);
            for (const ob of this.state.bat){
                console.log(ob[0]);
                console.log(ob[1]);
                console.log(ob[2]);
            }
            console.log(this.state.overallBalance);
        });
    }

    render() {
        let overallBalance;
        if (this.state.overallBalance != 0){
            overallBalance = (parseFloat(this.state.overallBalance)/100).toString() + ' €';
        }

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

                <div>
                    <h1>Overall Balance: {overallBalance}</h1>
                </div>

                <div id="tokensContainer">
                    {this.state.bat.map((value, index) => {
                        return <BAT_Token iban={value[0]} currencyCode={value[1]} balance={value[2]} token={value[3]} addressOwner={value[4]}/>
                    })}
                </div>

                {/*<BAT_Token iban={this.state.bat[0].iban} currentBalance="102344"/>*/}
            </div>
        );
    }
}

export default Dashboard;