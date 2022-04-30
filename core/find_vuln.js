const { find_Element_by_dfs, delete_loc_by_dfs } = require("./lib")

class Find_Vuln{

    constructor(Contracts){
        this.Contracts = Contracts
        this.vuln = []
    }
    
    // 查找溢出漏洞
    find_overFlow(contract){
        // 版本小于0.8 才可能存在漏洞
        if (contract.version[0] < "0.8.0"){
            // 遍历函数
            contract.funcitons.forEach(c_function =>{
                // 获取污点
                let spots = c_function.getSpotChain()
                // 获取所有表达式
                let mathExpress = c_function.getFuctionMathExpress()
                
                let vuln_math_express = []
                // 检测污点是否在数学表达式中
                for(let mathexpress of mathExpress){

                    // 判断表达式中是否采用了安全库
                    let math_express_stringify = JSON.stringify(mathexpress)
                    if(math_express_stringify.match(/safemath/i)){
                        break // 安全
                    }
                    
                    for(let main_spot of spots.keys()){
                        let flag = []
                        // 判断主污染点是否在表达式中
                        find_Element_by_dfs(mathexpress, "", "name", main_spot, flag)
                        if(flag.length != 0){
                            vuln_math_express.push(mathexpress)
                            flag = []
                            break
                        }else{
                            // 判断子污点
                            for( let spot of spots.get(main_spot)){
                                let tmp_spot = JSON.parse(JSON.stringify(spot))
                                delete_loc_by_dfs(tmp_spot)   //删除loc

                                find_Element_by_dfs(mathexpress , "" , "left" , JSON.stringify(tmp_spot) , flag , 1 )
                                find_Element_by_dfs(mathexpress , "" , "right", JSON.stringify(tmp_spot) , flag , 1 )
                                if(flag.length != 0) break
                            }
                        }

                        if(flag.length != 0){
                            vuln_math_express.push(mathexpress)
                            flag = []
                            break
                        }

                    }
                }

                // 添加到漏洞数组中
                if(vuln_math_express.length != 0){
                    
                    let spot_link = c_function.get_spots_link(spots)

                    vuln_math_express.forEach(vuln_math =>{
                        let vuln_data = {
                            "Contract":contract.name, 
                            "Funtion": c_function.name , 
                            "type": "overFlow" , 
                            "vuln_loc" : vuln_math.loc,
                            "vuln_info" : spot_link
                        }
    
                        this.vuln.push(vuln_data)
                    })
                }
                
            })
        }
    }

    //tx.origin依赖漏洞 
    find_tx_origin(contract){

        let tx_origin_ast = {
            "type": "MemberAccess",
            "expression": {
                "type": "Identifier",
                "name": "tx"
            },
            "memberName": "origin"
        }

        let finded_tx_origin = []
        let find_MemberAccess = []
        let find_operator_equals =  [] 
        find_Element_by_dfs(contract.astTree, "" , "operator" , "==" , find_operator_equals)
        find_Element_by_dfs(find_operator_equals, "", "type" , tx_origin_ast.type, find_MemberAccess)

        // 匹配 tx.origin
        for(let memberAccess of find_MemberAccess){
            if (memberAccess.memberName == tx_origin_ast.memberName && tx_origin_ast.expression.name == memberAccess.expression.name){
                finded_tx_origin.push(memberAccess)
            }
        }

        if(finded_tx_origin.length != 0){

            finded_tx_origin.forEach(tx_origin =>{
                let vuln_data = {
                    "Contract":contract.name, 
                    "Funtion": null , 
                    "type": "tx.origin" , 
                    "vuln_loc" : tx_origin.loc
                }
                this.vuln.push(vuln_data)
            })
        }
    }

    find_vuln_core(){

        //  遍历合约 依次进行漏洞检测
        this.Contracts.forEach(contract => {
            this.find_overFlow(contract)
            this.find_tx_origin(contract)

            
        });
        //console.log(JSON.stringify(this.vuln, null ,2))
    }

}


module.exports = Find_Vuln