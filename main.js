const { log, table } = require('console');
const SHA256 = require('crypto-js/sha256');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    constructor(timestamp, transactions, prevHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = '';
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

    createTransaction(transaction){
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

// #1
// let ddCoin = new BlockChain();
// ddCoin.addBlock(new Block(1, "22",{amount: 4}))
// ddCoin.addBlock(new Block(2, "23",{amount: 41}))
// console.log(JSON.stringify(ddCoin, null, 4));
// log('Is blockChain valid? '+ddCoin.isChainValid())
// //  tampering
// ddCoin.chain[1].data = {blah: '1112'};
// log('After tampering: Is blockChain valid? '+ddCoin.isChainValid())

// // #2
// let ddCoin = new BlockChain();
// log('Mining block 1...')
// ddCoin.addBlock(new Block(1, "22",{amount: 4}));

// log('Mining block 2...')
// ddCoin.addBlock(new Block(2, "23",{amount: 41}));


// #3 - creating a crypto currency
let ddCoin = new BlockChain();
ddCoin.createTransaction(new Transaction('address1', 'address2', 90));
ddCoin.createTransaction(new Transaction('address2', 'address1', 9));

log('\nStarting the miner....')
ddCoin.minePendingTransactions('audhil-public-key-of-wallet');

log('\nBalance of Audhil\'s wallet is: '+ddCoin.getBalanceOfAddress('audhil-public-key-of-wallet'));

ddCoin.createTransaction(new Transaction('address3', 'address4', 12));
ddCoin.minePendingTransactions('xavier-public-key-of-wallet');

log('\nTill now, Balance of Audhil\'s wallet is: '+ddCoin.getBalanceOfAddress('audhil-public-key-of-wallet'));

ddCoin.createTransaction(new Transaction('audhil-public-key-of-wallet', 'address1', 9));
ddCoin.minePendingTransactions('musk-public-key-of-wallet');
log('\nTill now, Balance of Audhil\'s wallet is: '+ddCoin.getBalanceOfAddress('audhil-public-key-of-wallet'));