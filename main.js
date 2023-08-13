const { log } = require('console');
const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, data, prevHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
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
    }

    createGenesisBlock(){
        return new Block(0, "13/08/2023", 'Genesis block', '0');
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        newBlock.prevHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
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

// #2
let ddCoin = new BlockChain();
log('Mining block 1...')
ddCoin.addBlock(new Block(1, "22",{amount: 4}));

log('Mining block 2...')
ddCoin.addBlock(new Block(2, "23",{amount: 41}));