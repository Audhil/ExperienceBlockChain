const { log } = require('console');
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec; //   needed for, 1. creating private, public key, 2. sign, 3. verify
const ec = new EC('secp256k1');  //  algorithm basis of bitcoin

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress+this.toAddress+this.amount).toString();
    }

    signTransaction(signingKey){
        //  we can sign transactions, which are our own
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        //  storing the signature in this class
        this.signature = sig.toDER('hex');
    }

    isValid(){
        //  for rewards transactions, fromAddress is null; and there's no signature needed
        if(this.fromAddress === null) {
          return true;
        }

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);    //  verifying hash of this transaction is signed by signature
    }
}

class Block {
    constructor(timestamp, transactions, prevHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.prevHash + this.timestamp+JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        log('Blocked Mined: '+this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningReward = 100;    //  100 coins as reward for successful mining
    }

    createGenesisBlock(){
        return new Block("13/08/2023", 'Genesis block', '0');
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);
        log('Block mined successfully!')
        this.chain.push(block);
        //  rewarding the miner
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include fromAddress & toAddress');
        }
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to the chain!');
        }
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const transaction of block.transactions){
                if(transaction.fromAddress === address){
                    balance -= transaction.amount;
                }

                if(transaction.toAddress === address){
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currBlock = this.chain[i];
            const preBlock = this.chain[i-1];

            if(!currBlock.hasValidTransactions()){
                return false;
            }

            if(currBlock.hash !== currBlock.calculateHash()){
                return false;
            }

            if(currBlock.prevHash !== preBlock.hash){
                return false;
            }
        }
        return true;
    }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;