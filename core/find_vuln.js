const {
    find_Element_by_dfs,
    delete_loc_by_dfs,
    find_code_by_loc
} = require("./lib")
const Vuln = require("./vuln")

class Find_Vuln {

    constructor(Contracts) {
        this.Contracts = Contracts
        this.vuln = []
    }

    // 查找溢出漏洞
    find_overFlow(contract) {
        // 版本小于0.8 才可能存在漏洞
        if (contract.version[0] < "0.8.0") {
            // 遍历函数
            contract.functions.forEach(c_function => {
                // 获取污点
                let spots = c_function.getSpotChain()
                // 获取所有表达式
                let mathExpress = c_function.getFuctionMathExpress()
                let vuln_math_express = []
                // 检测污点是否在数学表达式中
                for (let mathexpress of mathExpress) {

                    // 判断表达式中是否采用了安全库
                    let math_express_stringify = JSON.stringify(mathexpress)
                    if (math_express_stringify.match(/safemath/i)) {
                        break // 安全
                    }

                    for (let main_spot of spots.keys()) {
                        let flag = []
                        // 判断主污染点是否在表达式中
                        find_Element_by_dfs(mathexpress, "", "name", main_spot, flag)
                        if (flag.length != 0) {
                            vuln_math_express.push(mathexpress)
                            flag = []
                            break
                        } else {
                            // 判断子污点
                            for (let spot of spots.get(main_spot)) {
                                let tmp_spot = JSON.parse(JSON.stringify(spot))
                                delete_loc_by_dfs(tmp_spot) //删除loc

                                find_Element_by_dfs(mathexpress, "", "left", JSON.stringify(tmp_spot), flag, 1)
                                find_Element_by_dfs(mathexpress, "", "right", JSON.stringify(tmp_spot), flag, 1)
                                if (flag.length != 0) break
                            }
                        }

                        if (flag.length != 0) {
                            vuln_math_express.push(mathexpress)
                            flag = []
                            break
                        }

                    }
                }

                // 添加到漏洞数组中
                if (vuln_math_express.length != 0) {

                    let spot_link = c_function.get_spots_link(spots)

                    vuln_math_express.forEach(vuln_math => {
                        let vuln_data = {
                            "Contract": contract.name,
                            "Function": c_function.name,
                            "type": "overFlow",
                            "vuln_loc": vuln_math.loc,
                            "vuln_info": spot_link
                        }

                        this.vuln.push(vuln_data)
                    })
                }

            })
        }
    }

    //tx.origin依赖漏洞 
    find_tx_origin(contract) {

        let tx_origin_ast = Vuln.tx_origin_ast

        let finded_tx_origin = []
        let find_MemberAccess = []
        let find_operator_equals = []
        find_Element_by_dfs(contract.astTree, "", "operator", "==", find_operator_equals)
        find_Element_by_dfs(find_operator_equals, "" , "left" , JSON.stringify(tx_origin_ast), finded_tx_origin, 1)
        find_Element_by_dfs(find_operator_equals, "" , "right" , JSON.stringify(tx_origin_ast), finded_tx_origin, 1)

        // find_Element_by_dfs(find_operator_equals, "", "type", tx_origin_ast.type, find_MemberAccess)

        // // 匹配 tx.origin
        // for (let memberAccess of find_MemberAccess) {
        //     if (memberAccess.memberName == tx_origin_ast.memberName && tx_origin_ast.expression.name == memberAccess.expression.name) {
        //         finded_tx_origin.push(memberAccess)
        //     }
        // }

        if (finded_tx_origin.length != 0) {

            finded_tx_origin.forEach(tx_origin => {
                let vuln_data = {
                    "Contract": contract.name,
                    "Function": null,
                    "type": "tx.origin",
                    "vuln_loc": tx_origin.loc
                }
                this.vuln.push(vuln_data)
            })
        }
    }

    // 查找重入漏洞
    find_reentrancy(contract) {

        let vuln_call = Vuln.vuln_call

        contract.functions.forEach(c_function => {

            // 查找 msg.sender.call.value
            let tmp_vuln_call = JSON.stringify(vuln_call.expression)
            let find_vuln_call = []

            find_Element_by_dfs(c_function.astTree, "", "expression", tmp_vuln_call, find_vuln_call, 1)

            if (find_vuln_call.length != 0) {
                //  修改用户态特征， 可以多个来轮番比较
                let balance = {
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
                let find_balacne = []
                find_Element_by_dfs(c_function.astTree, "", "left", JSON.stringify(balance), find_balacne, 1)

                find_balacne.forEach(balance => {
                    // 判断前后位置
                    if (balance.loc.start.line > find_vuln_call[0].loc.start.line) {
                        let vuln_data = {
                            "Contract": contract.name,
                            "Function": c_function.name,
                            "type": "reentrancy",
                            "vuln_loc": [find_vuln_call[0].loc, balance.loc],
                        }
                        this.vuln.push(vuln_data)
                    }
                })
            }

        })

    }

    // 未检查返回值
    find_unreturn(contract) {

        let black_function = "call|codecall|send|delegatecall|staticcal"
        contract.functions.forEach(c_function => {
            let astTree = c_function.astTree
            let find_function = []
            find_Element_by_dfs(astTree, "", "type", "FunctionCall", find_function)

            find_function.forEach(_function => {
                // 寻找黑名单函数
                if (_function.expression != undefined && black_function.indexOf(_function.expression.memberName) != -1) {

                    // 检测是否存在require
                    let code = " " + find_code_by_loc(_function.loc, contract.all_code).trim()
                    if (code.indexOf("require(") == -1) {
                        let vuln_data = {
                            "Contract": contract.name,
                            "Function": c_function.name,
                            "type": "unreturn",
                            "vuln_code": code,
                            "vuln_msg": `函数 <font color="red" size="4">${_function.expression.memberName}</font> 未检查返回值`
                        }
                        this.vuln.push(vuln_data)
                    }
                }
            })
        })
    }

    // 危险调用
    find_delegatecall(contract) {

        contract.functions.forEach(c_function => {

            let astTree = c_function.astTree
            let find_delegatecall = []
            find_Element_by_dfs(astTree, "", "memberName", "delegatecall", find_delegatecall) // 查找是否存在delegatecall函数

            find_delegatecall.forEach(tmp_find_delegatecall => {

                let tmp = JSON.parse(JSON.stringify(tmp_find_delegatecall))
                delete_loc_by_dfs(tmp)
                // 找到对应节点的父节点
                let find_delegatecall_parent = []
                find_Element_by_dfs(astTree, "", "expression", JSON.stringify(tmp), find_delegatecall_parent, 1)
                // 遍历参数
                find_delegatecall_parent.forEach(delegatecall_parent => {

                    if (delegatecall_parent.type == "FunctionCall") {
                        // 分情况
                        let vuln_msg = ""
                        if (JSON.stringify(delegatecall_parent.arguments).indexOf("msg.") != -1) {
                            vuln_msg = "delegatecall 函数用户可控，可能存在恶意函数执行"
                        } else {
                            vuln_msg = "存在delegatecall 函数，可能存在变量覆盖"
                        }

                        let vuln_data = {
                            "Contract": contract.name,
                            "Function": c_function.name,
                            "type": "delegatecall",
                            "vuln_loc": delegatecall_parent.loc,
                            "vuln_msg": vuln_msg
                        }

                        this.vuln.push(vuln_data)
                    }
                })

            })

        })
    }

    find_vuln_core() {

        //  遍历合约 依次进行漏洞检测
        this.Contracts.forEach(contract => {

            this.find_overFlow(contract)
            this.find_tx_origin(contract)
            this.find_reentrancy(contract)
            this.find_delegatecall(contract)
            this.find_unreturn(contract)

        });
    }

}


module.exports = Find_Vuln