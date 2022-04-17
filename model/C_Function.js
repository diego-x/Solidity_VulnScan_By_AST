const { getDeclareVarOrFuctionParams, find_Element_by_dfs, getMathExpress } = require("../core/lib")

class C_Function{

    constructor(astTree){
        this.astTree = astTree
        // 因为constructor 解析不出来所以暂且认为 fuction为null的函数为 constructor
        this.name =  astTree.name ?  astTree.name : "constructor"
        this.params = []
        this.getFuctionParams()   // 获取函数参数

        this.getSpotChain()

    }
    getFuctionParams(){
        // 查找函数的 变量部分
        let find_FunctionParams = []
        find_Element_by_dfs(this.astTree, "" , "type", "VariableDeclaration", find_FunctionParams)

        this.params = getDeclareVarOrFuctionParams(find_FunctionParams)
    }

    getFuctionMathExpress(){
        // 获取该函数的数学表达式
        let mathExpress =  getMathExpress(this.astTree)
        // console.log(mathExpress)
        // if(this.name == "vote"){
        //     console.log(JSON.stringify(this.astTree,null,2))
        // }
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
        if(this.name == "vote"){
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
            console.log(JSON.stringify(binaryOperation, null ,2 ))
            // 污点检测
            binaryOperation.forEach(operation=>{

               let function_test = function(express, spot){
                    // 函数中检测参数是否包含污点
                    let function_name = express.expression.name  // 后期检测safemath
                    
                    let args =  express.arguments  
                    let flag = 0
                    args.forEach(arg=>{
                        if(flag == 0 && spot.indexOf("{") == -1 && arg.name == spot){
                            flag = 1
                        }else if(flag == 0 && JSON.stringify(arg) == spot ){
                            flag = 1
                        }
                    }) 
                    return flag
               }
               // 赋值表达式右侧为 计算
               if(operation.right.type == "BinaryOperation"){
                  
                   // 检测右侧表达式是否包含污点
                   spot_params.forEach(function(sub_spots,main_spot){
                       let tmp_sub_spots = sub_spots
                       let flag = 0   // 是否存在污点
                       // 先判断是否包含主污染量
                       if(flag == 0 && operation.right.left.hasOwnProperty("name") && operation.right.left.name == main_spot){
                            tmp_sub_spots.push(operation.left)
                            flag = 1
                       }
                       if(flag == 0 && operation.right.right.hasOwnProperty("name") && operation.right.right.name == main_spot ){
                            tmp_sub_spots.push(operation.left)
                            flag = 1
                       }
                        // 函数判断 
                       if (flag == 0 && operation.right.left.type == "FunctionCall" && function_test(operation.right.left, main_spot)){
                            tmp_sub_spots.push(operation.left)
                            flag = 1
                        }else if( flag == 0 && operation.right.right.type == "FunctionCall" && function_test(operation.right.right, main_spot)){
                            tmp_sub_spots.push(operation.left)
                            flag = 1
                        }
                      
                       // 判断 中间污染量
                       if(flag == 0){

                            sub_spots.forEach(spot=>{
                                let spot_json = JSON.stringify(spot)
                                let left_json =  JSON.stringify(operation.right.left)
                                let right_json = JSON.stringify(operation.right.right)
                                // 转化成json 来判断
                                if(flag == 0 && (left_json == spot_json || right_json == spot_json )  ) { 
                                    tmp_sub_spots.push(operation.left)
                                    flag = 1
                                }
                                // 函数判断 
                                if (flag == 0 && operation.right.left.type == "FunctionCall" && function_test(operation.right.left, spot_json)){
                                    tmp_sub_spots.push(operation.left)
                                    flag = 1
                                }else if( flag == 0 && operation.right.right.type == "FunctionCall" && function_test(operation.right.right, spot_json)){
                                    tmp_sub_spots.push(operation.left)
                                    flag = 1
                                }

                            })
                       }

                       // 如果存在污染点则修改
                       if(flag == 1) spot_params.set(main_spot, tmp_sub_spots)
                    })

               }else if(operation.operator.length == 2){
                    // 右侧只有一个表达式
                    // 检测右侧表达式是否包含污点
                    spot_params.forEach(function(sub_spots,main_spot){
                        let tmp_sub_spots = sub_spots
                        let flag = 0   // 是否存在污点
                        // 先判断是否包含主污染量
                        if(flag == 0 && operation.right.hasOwnProperty("name") && operation.right.name == main_spot){
                            tmp_sub_spots.push(operation.left)
                            flag = 1
                        }

                        // 函数判断 
                        //console.log(main_spot,operation.right,function_test(operation.right, main_spot))
                        if (flag == 0 && operation.right.type == "FunctionCall" && function_test(operation.right, main_spot)){
                            tmp_sub_spots.push(operation.left)
                            flag = 1
                        }
                    
                        // 判断 中间污染量
                        if(flag == 0){
                            sub_spots.forEach(spot=>{
                                let spot_json = JSON.stringify(spot)
                                let right_json =  JSON.stringify(operation.right)
                                // 转化成json 来判断
                                if(flag == 0 &&  right_json == spot_json   ) { 
                                    tmp_sub_spots.push(operation.left)
                                    flag = 1
                                }
                                // 函数判断 
                                if (flag == 0 && operation.right.type == "FunctionCall" && function_test(operation.right, spot_json)){
                                    tmp_sub_spots.push(operation.left)
                                    flag = 1
                                }
                            })
                        }

                        // 如果存在污染点则修改
                        if(flag == 1) spot_params.set(main_spot, tmp_sub_spots)
                    })                   
               }else if (operation.right.type == "FunctionCall"){
                   // 右侧为函数
                   // 检测右侧表达式是否包含污点
                   console.log(operation)
                   spot_params.forEach(function(sub_spots,main_spot){
                       let flag = 0
                       let tmp_sub_spots = sub_spots
                       // 函数判断 
                       if (flag == 0 && function_test(operation.right, main_spot)){
                            tmp_sub_spots.push(operation.left)
                            flag = 1
                        }
                        // 判断 中间污染量
                       if(flag == 0){

                            sub_spots.forEach(spot=>{
                                let spot_json = JSON.stringify(spot)
                                // 转化成json 来判断
                                if(flag == 0 && function_test(operation.right , spot_json)  ) { 
                                    tmp_sub_spots.push(operation.left)
                                    flag = 1
                                }
                            })
                        }
                        // 如果存在污染点则修改
                        if(flag == 1) spot_params.set(main_spot, tmp_sub_spots)

                   })
               }
            
            })
            console.log(spot_params)
        }  
    }
}

module.exports =  C_Function