const { log } = require('console');
const EC = require('elliptic').ec; //   needed for, 1. creating private, public key, 2. sign, 3. verify
const ec = new EC('secp256k1');  //  algorithm basis of bitcoin

const {BlockChain, Transaction} = require('./blockchain')

const myKey = ec.keyFromPrivate('7e45e0e5b857f6d9133a9d49d002eeb901152648f6b5aaca6d9418aaae28862d');
const myWalletAddress = myKey.getPublic('hex');

let ddCoin = new BlockChain();


const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
ddCoin.addTransaction(tx1);

log('\nStarting the miner....')
ddCoin.minePendingTransactions(myWalletAddress);

log('\nBalance of Audhil\'s wallet is: '+ddCoin.getBalanceOfAddress(myWalletAddress ));
