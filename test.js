var parser = require("solidity-parser-antlr")
const fs = require("fs")
const ast_to_class = require("./core/ast_to_class")
const { find_Element_by_dfs, find_code_by_loc } = require("./core/lib")
const Find_Vuln = require("./core/find_vuln")

input = fs.readFileSync('./sol/Ballot.sol', "utf-8")
let res = parser.parse(input, {"loc" : true})
fs.writeFileSync("./sol/test.json", JSON.stringify(res, null, 2))


Contracts = ast_to_class(res, input)
// console.log(Contracts[0].getBalance())
let find_vuln = new Find_Vuln(Contracts)
find_vuln.find_vuln_core()

// console.log(find_vuln.vuln)
// code = find_code_by_loc(find_vuln.vuln[0].vuln_loc ,input)
// console.log(code)
// for(let vuln of find_vuln.vuln){
//     code = find_code_by_loc(vuln.vuln_loc[0] ,input) + "\n"
//     code += find_code_by_loc(vuln.vuln_loc[1] ,input)
//     console.log(code)
//     console.log(vuln)
// }