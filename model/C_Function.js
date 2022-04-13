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
            let spot_params = []
            this.params.forEach(param => {
                if(param.type_name.indexOf("uint") != -1){
                    spot_params.push(param.name)
                }else if(param.type_name == "Array" && param.type_name.array_type.indexOf("uint") != -1 ){
                    // 数组类型的uint 参数
                    spot_params.push(param.name)
                }
            });    
            
            //所有的赋值运算
            ... tree-> code
        }

        

    }
}

module.exports =  C_Function