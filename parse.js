// var SolidityParser = require("solidity-parser");
// const tool =  require('./core/lib')
// const C_Function =  require('./model/C_Function')
// const Contract =  require('./model/C_Function')

var parser=require("solidity-parser-antlr")
const fs = require("fs")
const ast_to_class = require("./core/ast_to_class")
const Find_Vuln = require("./core/find_vuln")


input = fs.readFileSync("sol/Ballot.sol","utf8")
res = parser.parse(input)

fs.writeFileSync("tmp.json", JSON.stringify(res, null ,2))
var Contracts = ast_to_class(res)

//console.log(Contracts)
var find_vuln = new Find_Vuln(Contracts)
find_vuln.find_vuln_core()
//console.log(Contracts)