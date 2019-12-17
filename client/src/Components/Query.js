import React from 'react';
import getWeb3 from "../utils/getWeb3";

import BAT_contract from "../contract-builds/BAT";
import '../App';
import "../style/queryPage.css";

const axios = require('axios').default;

class QueryPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            address: null,
            web3: null,
            instance: null,
            token: null,
            accounts: null,
            personal_info: null
        };
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
            // if (this.state.token){
            //
            // }
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
        }
    };

    componentWillMount() {
        this.laodWeb3();

        // if (this.state.token){
        //     this.getCashAccounts();
        this.getCashAccounts();
        this.getInfoBankAccountOwner();
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


    // async getAddresses(){
    //     const response =
    //         await axios.get("https://simulator-api.db.com:443/gw/dbapi/referenceData/addresses/v2",
    //             {headers: {Authorization: "Bearer "+this.state.token}});
    //     console.log(response.data);
    // }
    //
        async getInfoBankAccountOwner(){
            await axios.get("https://simulator-api.db.com:443/gw/dbapi/referenceData/partners/v2/",
                {headers: {Authorization: "Bearer "+this.state.token}}).then(async (response) => {
                    this.setState({personal_info: response.data.partners[0].naturalPerson});
                console.log(this.state.personal_info);
            });
    }

    async getCashAccounts(){
        await axios.get("https://simulator-api.db.com:443/gw/dbapi/banking/cashAccounts/v2/?limit=10&offset=0",
            {headers: {Authorization: "Bearer "+this.state.token}}).then(async (response) => {
                this.setState({accounts: response.data.accounts});
                console.log(this.state.accounts);
            // for (const element of accounts) {
            //     await this.state.instance.methods.checkIfTokenExistGivenIbanAndOwner(element.iban, this.state.address).call().then(async (response) => {
            //         if (response == false){
            //             await this.state.instance.methods.createBankAccount(element.iban,element.currencyCode,parseInt(element.currentBalance * 100,10)).send({ from: this.state.address});
            //             const idToken = await this.state.instance.methods.returnIdGivenIBAN(element.iban).call();
            //             const bankAccount = await this.state.instance.methods.getBankAccount(idToken).call();
            //             console.log(element);
            //             console.log(bankAccount);
            //         } else {
            //             console.log("I'm here'");
            //             const idToken = await this.state.instance.methods.returnIdGivenIBAN(element.iban).call();
            //             await this.state.instance.methods.getAccountBalance(idToken).call().then(async (response) => {
            //                 if (response != parseInt(element.currentBalance * 100,10)){
            //                     await this.state.instance.methods.SetBankAccountBalance(idToken,parseInt(element.currentBalance * 100,10)).send({from: this.state.address});
            //                 }else {
            //                     console.log("No need to update token balance");
            //                 }
            //             });
            //         }
            //     });
            // }
        });
    }

    componentWillUnmount() {
        this.state.token = null;
    }



    renderTableData(){
        return this.state.accounts.map((account, index) => {
            return (
                <tr className="tableRow" key={account.iban}>
                    <td className="ibanColumn">{account.iban}</td>
                    <td>
                        <button className="buttonBlockchain" type="button" onClick={async () => {
                            await this.state.instance.methods.createBankAccount(
                            account.iban,account.currencyCode, parseInt(account.currentBalance * 100,10)).
                            send({ from: this.state.address});}}>Put on blockchain</button>
                    </td>
                </tr>
            )
        });
    }

    handleIbanToInsert = async (account) => {
        await this.state.instance.methods.createBankAccount(
            account.iban,account.currencyCode,
            parseInt(account.currentBalance * 100,10)).
        send({ from: this.state.address});
        return(console.log("nella merda"));
    };

    render() {
        if (this.state.accounts === null){
            return(<h1> Loading ... </h1>);
        } else {
            return (
                <div>
                    <button className="button button1" onClick={()=> {window.location.href = '/dashboard';}}>Back to dashboard</button>
                    <div>
                        <table id="bankData">
                            <tbody>
                                <tr key="title">
                                    <th>IBAN</th>
                                </tr>
                                {this.renderTableData()}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    }
}

export default QueryPage;