// 重入漏洞 msg.sender.call.value() 特征
const vuln_call = [
  {
    "expression": {
        "type": "MemberAccess",
        "expression": {
            "type": "MemberAccess",
            "expression": {
                "type": "MemberAccess",
                "expression": {
                    "type": "Identifier",
                    "name": "msg"
                },
                "memberName": "sender"
            },
            "memberName": "call"
        },
        "memberName": "value"
    }
  }
]


// tx.origin 特征
const tx_origin_ast = [
  {
    "type": "MemberAccess",
    "expression": {
        "type": "Identifier",
        "name": "tx"
    },
    "memberName": "origin"
  }
]
// 重入漏洞 修改用户态的特征 1. balance[msg.sender] 2. ....
const user_balance = [
  {
      "type": 'IndexAccess',
      "base": {
          "type": 'Identifier',
          name: 'balances'
      },
      "index": {
          "type": 'MemberAccess',
          "expression": {
              type: 'Identifier',
              name: 'msg'
          },
          "memberName": 'sender'
      }
  }
]

// 未检查返回值漏洞 需要关注的函数列表
const unreturn_check_function = "call|codecall|send|delegatecall|staticcal"

module.exports.vuln_call = vuln_call
module.exports.tx_origin_ast = tx_origin_ast
module.exports.user_balance = user_balance
module.exports.unreturn_check_function = unreturn_check_function