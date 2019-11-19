pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract BAT is ERC721 {

struct CreditCardData{
string embossedLine;
string expiryDate;
bool hasDebitFeatures;
string productName;
string securePAN;
string technicalId;
}

struct Addressess{
string addressType;
string city;
string country;
string houseNumber;
bool registeredResidence;
string street;
string zip;
}

struct EmailContacts {
string emailAddress;
string emailAddressType;
}

struct PersonalData{
string academicTitle;
string birthName;
string birthPlace;
string dateOfBirth;
string firstName;
string lastName;
string gender;
string nationality;
}

struct CashAccount {
string iban;
string currencyCode;
int currentBalance;
}

struct BankAccount {
PersonalData personalInfo;
Addressess addressInfo;
EmailContacts emailInfo;
CashAccount cashAccountInfo;
CreditCardData creditCardInfo;
}

uint lastTokenId;

mapping(uint256 => BankAccount) public accounts;

/*TO DO
* Add a function to know if an IBAN is from the current sender or it's owned by another
* account and the send the events*/

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

event personalInfoUpdated (
address owner,
uint tokenID);

event addressInfoUpdated (
address owner,
uint tokenID);

event emailInfoUpdated (
address owner,
uint tokenID);

event creditCardInfoUpdated (
address owner,
uint tokenID);

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

event noBankAccountOwned (
address _address);

function checkIbanAlreadyExist (string memory _iban, address _owner) public returns (bool){
if (lastTokenId != 0){
for (uint i=1; i<=lastTokenId; i++){
if (keccak256(abi.encodePacked((accounts[i].cashAccountInfo.iban))) == keccak256(abi.encodePacked((_iban)))){
if (ownerOf(i) == _owner){
emit bankAccountAlreadyCreated(_owner,i,accounts[i].cashAccountInfo.iban);
return true;
}else{
emit bankAccountOwnedByOther(ownerOf(i),_owner,i,accounts[i].cashAccountInfo.iban);
return true;
}
}
}
return false;
}
return false;
}

function createBankAccount(string memory _iban, string memory _currencyCode) onlyIfIbanDidNotExist(_iban, msg.sender) public {
lastTokenId += 1;

accounts[lastTokenId].cashAccountInfo.iban = _iban;
accounts[lastTokenId].cashAccountInfo.currencyCode = _currencyCode;

_mint(msg.sender, lastTokenId);

emit bankAccountCreated(msg.sender, lastTokenId, accounts[lastTokenId].cashAccountInfo.iban);
}

function updatePersonalInfo (
string memory _academicTitle,
string memory _birthName,
string memory _birthPlace,
string memory _dateOfBirth,
string memory _firstName,
string memory _lastName,
string memory _gender,
string memory _nationality,
string memory _iban) public {
uint _tokenID = returnIdGivenIBAN(_iban);
require (
_tokenID != 0,
"Bank Account not registered");
accounts[_tokenID].personalInfo.academicTitle = _academicTitle;
accounts[_tokenID].personalInfo.birthPlace = _birthPlace;
accounts[_tokenID].personalInfo.birthName = _birthName;
accounts[_tokenID].personalInfo.dateOfBirth = _dateOfBirth;
accounts[_tokenID].personalInfo.firstName = _firstName;
accounts[_tokenID].personalInfo.lastName = _lastName;
accounts[_tokenID].personalInfo.gender = _gender;
accounts[_tokenID].personalInfo.nationality = _nationality;

emit personalInfoUpdated(msg.sender, _tokenID);
}

function updateAddressessInfo(
string memory _addressType,
string memory _city,
string memory _country,
string memory _houseNumber,
bool _registeredResidence,
string memory _street,
string memory _zip,
string memory _iban) public {
uint _tokenID = returnIdGivenIBAN(_iban);
require (
_tokenID != 0,
"Bank Account not registered");
accounts[_tokenID].addressInfo.addressType = _addressType;
accounts[_tokenID].addressInfo.city = _city;
accounts[_tokenID].addressInfo.country = _country;
accounts[_tokenID].addressInfo.houseNumber = _houseNumber;
accounts[_tokenID].addressInfo.registeredResidence = _registeredResidence;
accounts[_tokenID].addressInfo.street = _street;
accounts[_tokenID].addressInfo.zip = _zip;

emit addressInfoUpdated(msg.sender, _tokenID);
}

function updateCreditCardInfo(
string memory _embossedLine,
string memory _expiryDate,
bool _hasDebitFeatures,
string memory _productName,
string memory _securePAN,
string memory _technicalId,
string memory _iban) public {
uint _tokenID = returnIdGivenIBAN(_iban);
require (
_tokenID != 0,
"Bank Account not registered");
accounts[_tokenID].creditCardInfo.embossedLine = _embossedLine;
accounts[_tokenID].creditCardInfo.expiryDate = _expiryDate;
accounts[_tokenID].creditCardInfo.hasDebitFeatures = _hasDebitFeatures;
accounts[_tokenID].creditCardInfo.productName = _productName;
accounts[_tokenID].creditCardInfo.securePAN = _securePAN;
accounts[_tokenID].creditCardInfo.technicalId = _technicalId;

emit creditCardInfoUpdated(msg.sender, _tokenID);
}

function updateEmailContactsInfo (
string memory _emailAddress,
string memory _emailAddressType,
string memory _iban) public {
uint _tokenID = returnIdGivenIBAN(_iban);
require (
_tokenID != 0,
"Bank Account not registered");
accounts[_tokenID].emailInfo.emailAddress = _emailAddress;
accounts[_tokenID].emailInfo.emailAddressType = _emailAddressType;

emit emailInfoUpdated(msg.sender, _tokenID);
}


function getBankAccount(uint _id) view public returns(string memory, string memory, int) {
BankAccount memory acc = accounts[_id];
return(acc.cashAccountInfo.iban, acc.cashAccountInfo.currencyCode, acc.cashAccountInfo.currentBalance);
}

function getAccountBalance (uint _id) view public returns (int) {
return (accounts[_id].cashAccountInfo.currentBalance);
}

function getAccountIBAN (uint _id) view onlyOwner(_id) public returns (string memory) {
return (accounts[_id].cashAccountInfo.iban);
}

function SetBankAccountBalance(uint _id, int _newBalance) onlyOwner(_id) public {
accounts[_id].cashAccountInfo.currentBalance = _newBalance;
emit balanceUpdated (msg.sender, _id, _newBalance);
}

function getAddressInfoByID (uint _tokenID) view public returns (
string memory,
string memory,
string memory,
string memory,
bool,
string memory,
string memory) {
return (accounts[_tokenID].addressInfo.addressType,
accounts[_tokenID].addressInfo.city,
accounts[_tokenID].addressInfo.country,
accounts[_tokenID].addressInfo.houseNumber,
accounts[_tokenID].addressInfo.registeredResidence,
accounts[_tokenID].addressInfo.street,
accounts[_tokenID].addressInfo.zip);
}

function getCreditCardInfoByID (uint _tokenID) view public returns (
string memory,
string memory,
bool,
string memory,
string memory,
string memory) {
return (accounts[_tokenID].creditCardInfo.embossedLine,
accounts[_tokenID].creditCardInfo.expiryDate,
accounts[_tokenID].creditCardInfo.hasDebitFeatures,
accounts[_tokenID].creditCardInfo.productName,
accounts[_tokenID].creditCardInfo.securePAN,
accounts[_tokenID].creditCardInfo.technicalId);
}

function getEmailInfoByID (uint _tokenID) view public returns (
string memory,
string memory) {
return (accounts[_tokenID].emailInfo.emailAddressType,
accounts[_tokenID].emailInfo.emailAddress);
}

function getPersonalDataInfoByID (uint _tokenID) view public returns (
string memory,
string memory,
string memory,
string memory,
string memory,
string memory,
string memory,
string memory) {
return (accounts[_tokenID].personalInfo.academicTitle,
accounts[_tokenID].creditCardInfo.birthName,
accounts[_tokenID].creditCardInfo.birthPlace,
accounts[_tokenID].creditCardInfo.dateOfBirth,
accounts[_tokenID].creditCardInfo.firstName,
accounts[_tokenID].creditCardInfo.lastName,
accounts[_tokenID].creditCardInfo.gender,
accounts[_tokenID].creditCardInfo.nationality);
}

function checkIfTokenExistForGivenAddress (address _account) view public returns (bool){
for (uint i=1; i<=lastTokenId; i++){
if (ownerOf(i) == _account){
return true;
}
}
return false;
}

function returnIdGivenIBAN (string memory _iban)view public returns (uint){
// if (checkIfTokenExistForGivenAddress(msg.sender)){
for (uint i=1; i<=lastTokenId; i++){
if (keccak256(abi.encodePacked((accounts[i].cashAccountInfo.iban))) == keccak256(abi.encodePacked((_iban)))){
return i;
}
}
// }
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

//  TO DO
function getOverallBalance (address _owner) public view returns (int){
int totalBalance = 0;
uint[] memory tokens = getAllTokenByOwnerAddress(_owner);
for (uint i=0; i<tokens.length; i++){
totalBalance += accounts[tokens[i]].cashAccountInfo.currentBalance;
}
return totalBalance;
}
}