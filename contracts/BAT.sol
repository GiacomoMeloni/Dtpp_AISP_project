pragma solidity ^0.5.5;

import "node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract BAT is ERC721 {

    enum Currency { EUR, USD }

    struct BankAccount {
        string iban;
        Currency currencyCode;
        int currentBalance;
    }

    uint lastTokenId;

    mapping(uint256 => BankAccount) public accounts;

    modifier onlyIfIbanDidNotExist(string memory _iban, address _owner) {
        bool check = checkIbanAlreadyExist(_iban,_owner);
        require(
            check == false,
            "This Iban is already registered"
        );
        _;
    }

    modifier onlyOwner(uint _tokenID) {
        require (
            msg.sender == ownerOf(_tokenID),
            "Only the token owner can access!");
        _;
    }

    event bankAccountCreated (
        address owner,
        uint tokenID,
        string iban);

    event bankAccountAlreadyCreated (
        address owner,
        uint tokenID,
        string iban);

    event bankAccountOwnedByOther (
        address realOwner,
        address userThatSendRequest,
        uint tokenID,
        string iban);

    event balanceUpdated (
        address owner,
        uint tokenID,
        int _newBalance);

    function checkIbanAlreadyExist (string memory _iban, address _owner) public returns (bool){
        if (lastTokenId != 0){
            for (uint i=1; i<lastTokenId; i++){
                if (keccak256(abi.encodePacked((accounts[i].iban))) == keccak256(abi.encodePacked((_iban)))){
                    if (ownerOf(i) == _owner){
                        emit bankAccountAlreadyCreated(_owner,i,accounts[i].iban);
                        return true;
                    }else{
                        emit bankAccountOwnedByOther(ownerOf(i),_owner,i,accounts[i].iban);
                        return true;
                    }
                }
            }
            return false;
        }
        return false;
    }

    function createBankAccount(string memory _iban, Currency _currencyCode) onlyIfIbanDidNotExist(_iban, msg.sender) public {
        lastTokenId += 1;

        accounts[lastTokenId].iban = _iban;
        accounts[lastTokenId].currencyCode = _currencyCode;

        _mint(msg.sender, lastTokenId);

        emit bankAccountCreated(msg.sender, lastTokenId, accounts[lastTokenId].iban);
    }

    function getBankAccount(uint _id) view public returns(string memory, Currency, int) {
        BankAccount memory acc = accounts[_id];
        return(acc.iban, acc.currencyCode, acc.currentBalance);
    }

    function getAccountBalance (uint _id) view public returns (int) {
        return (accounts[_id].currentBalance);
    }

    function getAccountIBAN (uint _id) view onlyOwner(_id) public returns (string memory) {
        return (accounts[_id].iban);
    }

    function SetBankAccountBalance(uint _id, int _newBalance) onlyOwner(_id) public {
        accounts[_id].currentBalance = _newBalance;
        emit balanceUpdated (msg.sender, _id, _newBalance);
    }

//    TO DO
//    Function that returns the token list owned by a specified address
//    function getAllTokenByOwnerAddress(address _owner) public returns (uint[]){
//        uint[] listOfTokens;
//        uint currentIndex = 0;
//        for (uint i=1; i<lastTokenId; i++){
//            if (ownerOf(i) == _owner){
//                listOfTokens[currentIndex] == i;
//                currentIndex++;
//            }
//        }
//        return listOfTokens;
//    }

//  TO DO
//  function getTheOverallBalance (address _owner) public returns (uint){
//      int totalBalance;
//      int[] tokens = getAllTokenByOwnerAddress(_owner);
//      for (uint i=0; i<tokens.length; i++){
//          totalBalance += accounts[tokens[i]].balance;
//      }
//      return totalBalance;
//  }

    
}
