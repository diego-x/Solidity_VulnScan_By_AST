// var SolidityParser = require("solidity-parser");
// const tool =  require('./core/lib')
// const C_Function =  require('./model/C_Function')
// const Contract =  require('./model/C_Function')

var parser=require("solidity-parser-antlr")
const fs = require("fs")
const ast_to_class = require("./core/ast_to_class")


input = fs.readFileSync("sol/Ballot.sol","utf8")
res = parser.parse(input)


ast_to_class(res)