const { code_to_ast } = require("./lib")

// 重入漏洞转账特征
let vuln_call_code = [ "msg.sender.call.value()" ]
// 重入漏洞用户态默认特征
let user_balance = [ "balances[msg.sender]" ]
// tx.origin 特征
let tx_origin_code = [ "tx.origin" ]



// code 转化为 ast
let vuln_call_ast = []
for(let code of vuln_call_code){
  vuln_call_ast.push(code_to_ast(code))
}

let tx_origin_ast = []
for(let code of tx_origin_code){
  tx_origin_ast.push(code_to_ast(code))
}

let user_balance_ast = []
for(let code of user_balance){
  user_balance_ast.push(code_to_ast(code))
}


// 未检查返回值漏洞 需要关注的函数列表
const unreturn_check_function = "call|codecall|send|delegatecall|staticcal"

// 溢出漏洞，安全的计算函数名称
const overflow_uncheck_list = ["sub", "add", "div", "mul"]

module.exports.vuln_call = vuln_call_ast
module.exports.tx_origin_ast = tx_origin_ast
module.exports.user_balance = user_balance_ast
module.exports.unreturn_check_function = unreturn_check_function
module.exports.overflow_uncheck_list = overflow_uncheck_list