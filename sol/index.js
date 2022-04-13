var Web3 = require("web3");
//连接到Ganache
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));




// var fs = require("fs");
// var data = fs.readFileSync("./Coin.json", "utf-8");

// // // //创建合约对象
// var contract = new web3.eth.Contract(JSON.parse(data),'0xFC0e23CE81a74ECbd347b186883887d2911bbF05');

// // // //调用合约的方法
// // // //我们可以在Remix中设置，在这里读取，或者反过来。交叉验证更加直观。

// //contract.methods.mint('0xf19Db1Dc9E9d8De225733d1DAEA95629317f1F0D',2).send({from:'0xf19Db1Dc9E9d8De225733d1DAEA95629317f1F0D'}).then(console.log);


// var abi = contract.methods.mint('0xcFAE0B7F119e5316f9a018E1E2dFDD16879af300',100).encodeABI();
// console.log(abi)
// // 0x40c10f190000000000000000000000001d33c9fab4e97b540bc60d197ef41b7903044ab00000000000000000000000000000000000000000000000000000000000000064
// // contract.methods.balances('0xf19Db1Dc9E9d8De225733d1DAEA95629317f1F0D').call().then(console.log);


var Tx = require('ethereumjs-tx').Transaction
var privatekey = Buffer.from('7e2ab158deb26db5e3a13392d985d543391231ad39ec7cde4d5dd86f1ed2f937','hex')

var param = {
    data : "0x40c10f19000000000000000000000000cfae0b7f119e5316f9a018e1e2dfdd16879af30000000000000000000000000000000000000000000000000000000000000064",
    nonce : 2,
    gasLimit : "0x493e0",
    gasPrice : "0x0",
    to : "0xFC0e23CE81a74ECbd347b186883887d2911bbF05"
}
var trans = new Tx(param)
trans.sign(privatekey)

console.log(trans.serialize().toString('hex'))

web3.eth.sendSignedTransaction('0x' + trans.serialize().toString('hex'))
