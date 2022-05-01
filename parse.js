var parser=require("solidity-parser-antlr")
const fs = require("fs")
const ast_to_class = require("./core/ast_to_class")
const Find_Vuln = require("./core/find_vuln")
const { Vuln_to_html } = require("./core/vuln_to_html")



input = fs.readFileSync("sol/Ballot.sol","utf8")
// { loc: true } 显示对应位置
res = parser.parse(input,{ loc: true })

fs.writeFileSync("tmp.json", JSON.stringify(res, null ,2))
var Contracts = ast_to_class(res , input)

//console.log(Contracts)
var find_vuln = new Find_Vuln(Contracts)
find_vuln.find_vuln_core()


var html = new Vuln_to_html(find_vuln.vuln,input)
html.getReport()
//console.log(Contracts)