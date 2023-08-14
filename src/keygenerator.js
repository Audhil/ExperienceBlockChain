const EC = require('elliptic').ec; //   needed for, 1. creating private, public key, 2. sign, 3. verify
const ec = new EC('secp256k1');  //  algorithm basis of bitcoin

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log('yup: public key: ', publicKey);
console.log('yup: private key: ', privateKey);