import React from 'react';
import getWeb3 from "../utils/getWeb3";

import BAT_contract from "../contract-builds/BAT";
import '../App';
import "../style/queryPage.css";
import {rejectSeries} from "async";

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
            personal_info: null,
            isRegistered: []
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
        this.laodWeb3().then(async ()=>{
            this.getCashAccounts();
            this.getInfoBankAccountOwner();
        });
    }

        async getInfoBankAccountOwner(){
            await axios.get("https://simulator-api.db.com:443/gw/dbapi/referenceData/partners/v2/",
                {headers: {Authorization: "Bearer "+this.state.token}}).then(async (response) => {
                    this.setState({personal_info: response.data.partners[0].naturalPerson});
                console.log(this.state.personal_info);
                console.log(this.state.personal_info.firstName);
                console.log(this.state.personal_info.lastName);
            });
    }

    async getCashAccounts(){
        await axios.get("https://simulator-api.db.com:443/gw/dbapi/banking/cashAccounts/v2/?limit=10&offset=0",
            {headers: {Authorization: "Bearer "+this.state.token}}).then(async (response) => {
                this.setState({accounts: response.data.accounts});
                response.data.accounts.forEach(async (element) => {
                    await this.state.instance.methods.checkIfTokenExistGivenIbanAndOwner(element.iban, this.state.address).call().then(async (response) => {
                        var newRegistered = this.state.isRegistered;
                        newRegistered.push(response);
                        this.setState({isRegistered: newRegistered});
                    });
                });
                console.log(this.state.accounts);
                console.log(this.state.isRegistered);
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

    changeButtonStatus(iban) {
        document.getElementById(iban).classList.remove('buttonBlockchain');
        document.getElementById(iban).classList.add('buttonAlreadyInBlockchain');
        document.getElementById(iban).innerText = "Registered";
    }

    renderTableData(){
        return this.state.accounts.map((account, index) => {
            if (this.state.isRegistered[index] === false){
                return (
                    <tr className="tableRow" key={account.iban}>
                        <td className="ibanColumn">{account.iban}</td>
                        <td>
                            <button id={account.iban} className="buttonBlockchain" type="button" onClick={async () => {
                                await this.state.instance.methods.createBankAccount(
                                    account.iban,
                                    account.currencyCode,
                                    parseInt(account.currentBalance * 100, 10,),
                                    this.state.personal_info.firstName,
                                    this.state.personal_info.lastName).send({from: this.state.address}).then(()=>{
                                    alert("Bank account with IBAN: " + account.iban + "  it's been registered");
                                    this.changeButtonStatus(account.iban);});
                                }}>Put on blockchain
                            </button>
                        </td>
                    </tr>
                );
            } else {
                return (
                    <tr className="tableRow" key={account.iban}>
                        <td className="ibanColumn">{account.iban}</td>
                        <td>
                            <button className="buttonAlreadyInBlockchain" type="button">Registered</button>
                        </td>
                    </tr>
                );
            }
        });
    }

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