import React from 'react';
import '../App';
import getWeb3 from "../utils/getWeb3";
import BAT_contract from "../contract-builds/BAT";

const axios = require('axios').default;


class QueryPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.state;
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
            // console.log(this.state.web3.accounts[0]);

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            // this.setState({ web3, accounts, contract: instance }, this.runExample);
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
            this.getAddresses();
        }
    }

    async getCashAccounts(){
        const response =
            await axios.get("https://simulator-api.db.com:443/gw/dbapi/banking/cashAccounts/v2/?limit=10&offset=0",
                {headers: {Authorization: "Bearer "+this.state.token}});
        console.log(response.data);
        console.log(response.data.accounts[0].iban.toString());
        console.log(this.state.instance);
        // await this.state.instance.methods.createBankAccount(response.data.accounts[0].iban,1).send({ from: this.state.address});
        //
        const idToken = await this.state.instance.methods.returnIdGivenIBAN(response.data.accounts[0].iban).call();
        console.log(idToken);
        // await this.state.instance.methods.SetBankAccountBalance(idToken, parseInt(response.data.accounts[0].currentBalance * 100,10)).send({ from: this.state.address});
        //
        const bankAccount = await this.state.instance.methods.getBankAccount(idToken).call();
        console.log(bankAccount/100);
    }

    async getAddresses(){
        const response =
            await axios.get("https://simulator-api.db.com:443/gw/dbapi/referenceData/addresses/v2",
                {headers: {Authorization: "Bearer "+this.state.token}});
        console.log(response.data);
    }

    componentWillUnmount() {
        this.state.token = null;
    }

    render() {
        return (
            <div className="About">
                <h1>Page for INFO about the prototype</h1>
            </div>
        );
    }
}

export default QueryPage;