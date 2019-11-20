import React from 'react';

class BAT_Token extends React.Component {
    constructor(){
        super();
    }

    render() {
        const balance = parseFloat(this.props.balance)/100;
        return(
          <div class="batContainer">
              <p>{this.props.token}</p>
              <p>{this.props.addressOwner}</p>
              <p>{this.props.iban}</p>
              <p>{balance}</p>
              <p>{this.props.currencyCode}</p>
          </div>
        );
    }
}

export default BAT_Token;