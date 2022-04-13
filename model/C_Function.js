const { getDeclareVarOrFuctionParams, find_Element_by_dfs, getMathExpress } = require("../core/lib")

class C_Function{

    constructor(astTree){
        this.astTree = astTree
        // 因为constructor 解析不出来所以暂且认为 fuction为null的函数为 constructor
        this.name =  astTree.name ?  astTree.name : "constructor"
        this.params = []
        this.getFuctionParams()   // 获取函数参数

        this.getFuctionMathExpress()

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
        console.log(mathExpress)
        // if(this.name == "vote"){
        //     console.log(JSON.stringify(this.astTree,null,2))
        // }
    }

    getSpotChain(){
        //   污点追踪

    }
}

module.exports =  C_Function