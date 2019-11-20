import React from 'react';
import "../style/BAT_Token.css";
import BAT_Token_Logo from "../images/BAT_Token.png";

class BAT_Token extends React.Component {
    constructor(){
        super();
    }

    render() {
        const balance = parseFloat(this.props.balance)/100;
        return(
          <div className="batContainer">
              <img src={BAT_Token_Logo} className="imageToken"/>
              <div>
                  <p># {this.props.token}</p>
                  <p>{this.props.addressOwner}</p>
                  <p>{this.props.iban}</p>
                  <h3>{balance} {this.props.currencyCode}</h3>
              </div>
          </div>
        );
    }
}

export default BAT_Token;