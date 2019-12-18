pragma solidity ^0.5.5;

import "node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract BAT is ERC721 {

    struct BankAccount {
        string iban;
        string currencyCode;
        int currentBalance;
        string name;
        string surname;
    }

    uint lastTokenId;

    mapping(uint256 => BankAccount) private accounts;

    /*TO DO
    * Add a function to know if an IBAN is from the current sender or it's owned by another
    * account and the send the events*/

    modifier onlyIfIbanDoNotExist(string memory _iban, address _owner) {
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
            for (uint i=1; i<=lastTokenId; i++){
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

    function createBankAccount(
        string memory _iban,
        string memory _currencyCode,
        int _balance,
        string memory _name,
        string memory _surname) onlyIfIbanDoNotExist(_iban, msg.sender) public {
        lastTokenId += 1;

        accounts[lastTokenId].iban = _iban;
        accounts[lastTokenId].currencyCode = _currencyCode;
        accounts[lastTokenId].currentBalance = _balance;
        accounts[lastTokenId].name = _name;
        accounts[lastTokenId].surname = _surname;

        _mint(msg.sender, lastTokenId);

        emit bankAccountCreated(msg.sender, lastTokenId, accounts[lastTokenId].iban);
    }

    function getBankAccount(uint _id) view public returns(string memory,
        string memory,
        int,
        uint,
        address,
        string memory,
        string memory) {
        return(
        accounts[_id].iban,
        accounts[_id].currencyCode,
        accounts[_id].currentBalance,
        _id,
        ownerOf(_id),
        accounts[_id].name,
        accounts[_id].surname);
    }

    function getCurrencyCode(uint _id) view public returns (string memory){
        return accounts[_id].currencyCode;
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

    function checkIfTokenExistForGivenAddress (address _account) view public returns (bool){
        for (uint i=1; i<=lastTokenId; i++){
            if (ownerOf(i) == _account){
                return true;
            }
        }
        return false;
    }

    function checkIfTokenExistGivenIbanAndOwner (string memory _iban, address _account) public view returns(bool) {
        for (uint i=1; i<=lastTokenId; i++){
            if (keccak256(abi.encodePacked((accounts[i].iban))) == keccak256(abi.encodePacked((_iban))) &&
            ownerOf(returnIdGivenIBAN(_iban))==_account){
                return true;
            }
        }
        return false;
    }

    function returnIdGivenIBAN (string memory _iban)view public returns (uint){
        for (uint i=1; i<=lastTokenId; i++){
            if (keccak256(abi.encodePacked((accounts[i].iban))) == keccak256(abi.encodePacked((_iban)))){
                return i;
            }
        }
        return 0;
    }

    //    Function that returns the token list owned by a specified address
    //    Due to solidity features the function returns max 10 bank accounts
    //    at the moment is not possible return dynamic array

    function getAllTokenByOwnerAddress(address _owner) public view returns (uint [] memory){
        uint[] memory listOfTokens = new uint[](10);
        uint currentIndex = 0;

        for (uint i=1; i<=lastTokenId; i++){
            if (ownerOf(i) == _owner){
                listOfTokens[currentIndex] = i;
                currentIndex++;
            }
        }
        return listOfTokens;
    }

    //Function to return the overall token balance using the owner address

    function getOverallBalance (address _owner) public view returns (int){
        int totalBalance = 0;
        uint[] memory tokens = getAllTokenByOwnerAddress(_owner);
        for (uint i=0; i<tokens.length; i++){
            totalBalance += accounts[tokens[i]].currentBalance;
        }
        return totalBalance;
    }
}