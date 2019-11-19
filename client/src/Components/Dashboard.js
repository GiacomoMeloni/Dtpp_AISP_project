import React from 'react';
import {Link} from 'react-router-dom';
import getWeb3 from "../utils/getWeb3";
import BAT_contract from "../contract-builds/BAT";
import LoadBankAccount from "./Load_Bank_Account";

const axios = require('axios').default;


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.state;
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
            window.location.href = 'https://simulator-api.db.com/gw/oidc/authorize?response_type=token&redirect_uri=https://localhost:3000/dashboard&client_id=2a01cbd0-a7a1-405b-88c9-5ecc51e1a7db';
        }
    }


    laodWeb3 = async () => {
        try {
            // Get network provider and web3 instance.
            this.state.web3 = await getWeb3();
            console.log(this.state.web3);
            // Use web3 to get the user's accounts.
            const account = (await this.state.web3.eth.getAccounts())[0];
            this.setState({ address: account });
            console.log(this.state.address);
            // Get the contract instance.
            const networkId = await this.state.web3.eth.net.getId();
            const deployedNetwork = BAT_contract.networks[networkId];
            this.setState({instance : new this.state.web3.eth.Contract(
                    BAT_contract.abi, deployedNetwork.address
                )});
            console.log(this.state.instance);

            if (this.state.token){
                this.getCashAccounts();
            }
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

    async getCashAccounts(){
        const response =
            await axios.get("https://simulator-api.db.com:443/gw/dbapi/banking/cashAccounts/v2/?limit=10&offset=0",
                {headers: {Authorization: "Bearer "+this.state.token}});
        // console.log(response.data);
        const iban = response.data.accounts[0].iban;
        // this.getTransactions(iban);
        // console.log(response.data.accounts[0].iban.toString());
        // console.log(this.state.instance);
        await this.state.instance.methods.createBankAccount(response.data.accounts[0].iban,1).send({ from: this.state.address});

        const idToken = await this.state.instance.methods.returnIdGivenIBAN(response.data.accounts[0].iban).call();
        // console.log(idToken);
        await this.state.instance.methods.SetBankAccountBalance(idToken, parseInt(response.data.accounts[0].currentBalance * 100,10)).send({ from: this.state.address});

        let bankAccount = await this.state.instance.methods.getBankAccount(idToken).call();
        bankAccount = bankAccount/100.00;
        console.log(bankAccount);
    }

    async checkTokenExist() {
        const check = await this.state.instance.methods.checkIfTokenExistForGivenAddress(this.state.address).call();
        console.log(check);
        if (check === true){
            return(
                <div>
                    <h2>L'account possiede token</h2>
                </div>
            );
        }else {
            return(
                <div>
                    <h2>L'account non possiede token</h2>
                </div>
            );
        }
    }

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