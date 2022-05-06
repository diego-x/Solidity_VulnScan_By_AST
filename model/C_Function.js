const { readJsonSync } = require("fs-extra")
const { getDeclareVarOrFuctionParams, find_Element_by_dfs, getMathExpress, delete_loc_by_dfs, find_code_by_loc } = require("../core/lib")

class C_Function{

    constructor(astTree , contract_code){
        this.astTree = astTree
        // 因为constructor 解析不出来所以暂且认为 fuction为null的函数为 constructor
        this.name =  astTree.name ?  astTree.name : "constructor"
        this.params = []
        this.getFuctionParams()   // 获取函数参数

        this.getSpotChain()
        this.all_code = contract_code

    }
    getFuctionParams(){
        // 查找函数的 变量部分
        let find_FunctionParams = []
        find_Element_by_dfs(this.astTree, "" , "type", "FunctionDefinition", find_FunctionParams)
        // 提取参数
        find_FunctionParams = find_FunctionParams[0].parameters
        this.params = getDeclareVarOrFuctionParams(find_FunctionParams)
    }

    getFuctionMathExpress(){
        // 获取该函数的数学表达式
        let mathExpress =  getMathExpress(this.astTree)
        return mathExpress
    }

    getBinaryOperation(){
        // 获取所有的赋值运算 包括 += -= =
        let binaryOperation_express = []
        let find_binaryOperation = [] 
        find_Element_by_dfs(this.astTree, "" , "type" ,"BinaryOperation", find_binaryOperation)
        
        find_binaryOperation.forEach(binaryOperation => {
            if (binaryOperation.operator in {"=":0 , "-=":0 , "+=":0 , "*=":0}){
                binaryOperation_express.push(binaryOperation)
            }
        });

        return binaryOperation_express
    }

    getSpotChain(){
        //   污点追踪
        // 筛选无符号类型的参数  spot_params 待检测的污点列表
        // 数据结构为 {"x" : [] }    后面为被污染的变量名称
        let spot_params = new Map();

        
        this.params.forEach(param => {
            let name = param.name
            if(param.type_name.indexOf("uint") != -1){
                spot_params.set(name, [])
            }else if(param.type_name == "Array" && param.array_type.indexOf("uint") != -1 ){
                // 数组类型的uint 参数
                spot_params.set(name, [])
            }
        });    

        //所有的赋值运算
        let binaryOperation =  this.getBinaryOperation()
        // 污点检测
        let find_spot = function (binaryOperation){
            binaryOperation.forEach(operation=>{
                
                // 判断表达式中是否采用了安全库
                let math_express_stringify = JSON.stringify(operation)
                if(math_express_stringify.match(/safemath/i) == null){
                    
                    let all_var = []  // 表达式中的所有变量
                    find_Element_by_dfs(operation.right, "", "type", "Identifier", all_var) 
                    let all_member = []  // 所有成员
                    find_Element_by_dfs(operation.right, "", "type", "MemberAccess", all_member)
                    let all_function= []  // 所有函数
                    find_Element_by_dfs(operation.right, "" , "type", "FunctionCall", all_function)

                    let tmp = []
                    let tmp1 = []
                    // 字符化 all_var   转化成json格式便于比较
                    all_var.forEach(element => {
                        delete_loc_by_dfs(element)
                        tmp.push(JSON.stringify(element))
                    });
                    all_var = tmp
                    // 字符化 all_member
                    all_member.forEach(element => {
                        delete_loc_by_dfs(element)
                        tmp1.push(JSON.stringify(element))
                    });
                    all_member = tmp1
                    

                    //  遍历污点
                    spot_params.forEach(function(sub_spots,main_spot){
                        let flag = 0
                        let tmp_sub_spots = sub_spots
                        // 判断主污点 
                        let tmp_main_spot = '{"type":"Identifier","name":"' + main_spot + '"}'
                        if (all_var.indexOf(tmp_main_spot) != -1) flag = 1
                        
                        if(flag == 0){
                            // 子污点判断
                            sub_spots.forEach(spot=>{
                                // 变量判断是否在污点列表里
                                let tmp_spot1 = JSON.parse(JSON.stringify(spot))
                                delete_loc_by_dfs(tmp_spot1)

                                let tmp_spot = JSON.stringify(tmp_spot1)
                                if (flag == 0 && all_var.indexOf(tmp_spot) != -1){
                                    flag = 1
                                }
                                // 成员判断
                                if (flag == 0 && all_member.indexOf(tmp_spot) != -1){
                                    flag = 1
                                }
                                // 判断函数
                            })
                        }
                        //  存在污点则放入污点列表
                        if(flag == 1 ) {
                            tmp_sub_spots.push(operation.left)
                            spot_params.set(main_spot, tmp_sub_spots)
                        }
                        
                    })
                }
             
            })
        }

        find_spot(binaryOperation)
        return spot_params
        
    }

    //  获取污染链
    get_spots_link(spots) {

        let spot_link = []

        for (let spot of spots) {
            let link = spot[0];
            for (let spot_ of spot[1]) {

                if (spot_.type == "Identifier") {
                    link += " -> " + spot_.name
                } else if(spot_.type == "MemberAccess"){
                    link += " -> " +    spot_.expression.name + "." +spot_.memberName 
                }else {
                    // 非主污染点 都采用原code
                    let spot_code = find_code_by_loc(spot_.loc, this.all_code, 0)
                    link += " -> " + spot_code
                }
            }
            spot_link.push(link)
        }

        return spot_link
    }

}

module.exports =  C_Function