
// 重入漏洞 msg.sender.call.value() 特征
const vuln_call = {
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


// tx.origin 特征
const tx_origin_ast = {
    "type": "MemberAccess",
    "expression": {
        "type": "Identifier",
        "name": "tx"
    },
    "memberName": "origin"
}



module.exports.vuln_call = vuln_call
module.exports.tx_origin_ast = tx_origin_ast