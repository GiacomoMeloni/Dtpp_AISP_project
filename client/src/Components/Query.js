import React from 'react';
import { Redirect } from 'react-router';
import '../App';
import getWeb3 from "../utils/getWeb3";
import BAT_contract from "../contract-builds/BAT";
import {Link} from "react-router-dom";
import Dashboard from "./Dashboard";

const axios = require('axios').default;


class QueryPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.state;
        console.log(this.state.iban);
        if(window.location.href != "https://localhost:3000/queryPage") {
            this.state.token = (window.location.hash.split('=', 2)[1]).split('&', 1);
            console.log(this.state.token);
        }
        console.log (this.state);
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

    componentDidMount() {
        this.laodWeb3();

        // if (this.state.token){
        //     this.getCashAccounts();
            // this.getAddresses();
            // this.getInfoBankAccountOwner();
            // this.getInfoCreditCard();
    }

    // async getTransactions(iban){
    //     const limit = "10";
    //     const url = "https://simulator-api.db.com:443/gw/dbapi/banking/transactions/v2/?iban=" + iban.toString() + "&sortBy=bookingDate%5BASC%5D&limit=" + limit + "&offset=0";
    //
    //     const response =
    //         await axios.get(url,
    //             {headers: {Authorization: "Bearer "+this.state.token}});
    //     console.log(response.data);
    // }
    //
    // async getInfoCreditCard(){
    //     const response =
    //         await axios.get("https://simulator-api.db.com:443/gw/dbapi/banking/creditCards/v1/",
    //             {headers: {Authorization: "Bearer "+this.state.token}});
    //     console.log(response.data);
    // }
    //
    // async getInfoBankAccountOwner(){
    //     const response =
    //         await axios.get("https://simulator-api.db.com:443/gw/dbapi/referenceData/partners/v2/",
    //             {headers: {Authorization: "Bearer "+this.state.token}});
    //     console.log(response.data);
    // }

    async getCashAccounts(){
        await axios.get("https://simulator-api.db.com:443/gw/dbapi/banking/cashAccounts/v2/?limit=10&offset=0",
            {headers: {Authorization: "Bearer "+this.state.token}}).then(async (response) => {
            const accounts = response.data.accounts;
            for (const element of accounts) {
                await this.state.instance.methods.checkIfTokenExistGivenIbanAndOwner(element.iban, this.state.address).call().then(async (response) => {
                    if (response == false){
                        await this.state.instance.methods.createBankAccount(element.iban,element.currencyCode,parseInt(element.currentBalance * 100,10)).send({ from: this.state.address});
                        const idToken = await this.state.instance.methods.returnIdGivenIBAN(element.iban).call();
                        const bankAccount = await this.state.instance.methods.getBankAccount(idToken).call();
                        console.log(element);
                        console.log(bankAccount);
                    } else {
                        console.log("I'm here'");
                        const idToken = await this.state.instance.methods.returnIdGivenIBAN(element.iban).call();
                        await this.state.instance.methods.getAccountBalance(idToken).call().then(async (response) => {
                            if (response != parseInt(element.currentBalance * 100,10)){
                                await this.state.instance.methods.SetBankAccountBalance(idToken,parseInt(element.currentBalance * 100,10)).send({from: this.state.address});
                            }else {
                                console.log("No need to update token balance");
                            }
                        });
                    }
                });
            }
        });
    }

    // async getAddresses(){
    //     const response =
    //         await axios.get("https://simulator-api.db.com:443/gw/dbapi/referenceData/addresses/v2",
    //             {headers: {Authorization: "Bearer "+this.state.token}});
    //     console.log(response.data);
    // }

    componentWillUnmount() {
        this.state.token = null;
    }

    render() {
        return (
            <div>
                <button onClick={()=> {window.location.href = '/dashboard';}}>Back to dashboard</button>
            </div>
        );
    }
}

export default QueryPage;