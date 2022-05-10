var parser = require("solidity-parser-antlr")
const fs = require("fs")
const ast_to_class = require("./core/ast_to_class")
const Find_Vuln = require("./core/find_vuln")
const { Vuln_to_html } = require("./core/vuln_to_html")



function parser_code(input ,save_path ){
    try {
        let res = parser.parse(input,{ loc: true })
        let  Contracts = ast_to_class(res , input)

        let find_vuln = new Find_Vuln(Contracts)
        find_vuln.find_vuln_core()

        let html = new Vuln_to_html(find_vuln.vuln, input, save_path)
        html.getReport()
        
        return "success"
    } catch (e) {
        if (e instanceof parser.ParserError) {
            console.log(e.errors)
            return JSON.stringify(e.errors)
        }else{
            return e.toString()
        }
        
    }
}


module.exports.parser_code = parser_code