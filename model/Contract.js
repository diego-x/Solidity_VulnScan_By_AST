const { find_Element_by_dfs, getDeclareVarOrFuctionParams, getVersion } = require("../core/lib")
const C_Function = require("./C_Function")

class Contract{

    constructor(astTree, version , contract_code){
        this.astTree = astTree    // 该合约的ast代码
        this.name = astTree.name  // 设置合约名称
        this.DeclareVars = []
        this.functions = []      // 函数类构成的数组
        this.getDeclareVar()           // 获取定义的合约成员
        this.getFuntion()       // 设置合约函数
        this.version = version   // 设置版本
        this.all_code = contract_code  // 所有的源代码
    }

    getDeclareVar(){

        // 先定位StateVariableDeclaration
        let find_StateVariableDeclaration = []
        find_Element_by_dfs(this.astTree , "" , "type", "StateVariableDeclaration", find_StateVariableDeclaration )
        // 再定位VariableDeclaration 否则会与函数参数重合
        let find_getDeclareVars = []
        find_Element_by_dfs(find_StateVariableDeclaration , "" , "type", "VariableDeclaration", find_getDeclareVars )

        this.DeclareVars =  getDeclareVarOrFuctionParams(find_getDeclareVars)

    }

    getFuntion(){
        // 查找该合约中的函数
        let find_FunctionDefinition = []
        find_Element_by_dfs(this.astTree, "", "type" , "FunctionDefinition", find_FunctionDefinition)
        // 创建函数类并赋值
        find_FunctionDefinition.forEach(function_ast => {
            this.functions.push(new C_Function(function_ast))
        })
    }

}


module.exports = Contract