const { find_Element_by_dfs } = require("./lib")

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
                                find_Element_by_dfs(mathexpress , "" , "left" , JSON.stringify(spot) , flag , 1 )
                                find_Element_by_dfs(mathexpress , "" , "right" , JSON.stringify(spot) , flag , 1 )
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
                    let vuln_data = {
                        "Contract":contract.name, 
                        "Funtion": c_function.name , 
                        "type": "overFlow" , 
                        "vuln_express" : vuln_math_express
                    }

                    this.vuln.push(vuln_data)
                }
                
            })
        }

        return false
        
    }

    find_vuln_core(){

        //  遍历合约 依次进行漏洞检测
        this.Contracts.forEach(contract => {
            this.find_overFlow(contract)
        });

        console.log(this.vuln)
    }

}


module.exports = Find_Vuln