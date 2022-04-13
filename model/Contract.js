const { find_Element_by_dfs, getDeclareVarOrFuctionParams } = require("../core/lib")
const C_Function = require("./C_Function")

class Contract{

    constructor(astTree){
        this.astTree = astTree    // 该合约的ast代码
        this.name = astTree.name  // 设置合约名称
        this.DeclareVars = []
        this.funcitons = []      // 函数类构成的数组
        this.getDeclareVar()           // 获取定义的合约成员
        this.getFuntion()       // 设置合约函数
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
        find_FunctionDefinition.forEach(funciton_ast => {
            this.funcitons.push(new C_Function(funciton_ast))
        })
    }

}


module.exports = Contract