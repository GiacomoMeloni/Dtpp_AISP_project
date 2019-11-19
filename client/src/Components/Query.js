import React from 'react';
import { Redirect } from 'react-router';
import '../App';
import getWeb3 from "../utils/getWeb3";
import BAT_contract from "../contract-builds/BAT";

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
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
        }
    };

    componentDidMount() {
        this.laodWeb3();

        if (this.state.token){
            this.getCashAccounts();
            // this.getAddresses();
            // this.getInfoBankAccountOwner();
            // this.getInfoCreditCard();
        }

        this.setState({queryDone: true});
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

        const bankAccount = await this.state.instance.methods.getBankAccount(idToken).call();
        // console.log(bankAccount);
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
        return this.state.queryDone
            ? <Redirect to="/dashboard" />
            : <div>
                <h2>Loading...</h2>
            </div>
    }
}

export default QueryPage;