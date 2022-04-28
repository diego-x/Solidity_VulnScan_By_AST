const Contract = require("../model/Contract");
const { find_Element_by_dfs, getVersion } = require("./lib");


function ast_to_class(ast){

    Contracts = []
    find_Contracts = []
    // 查找合约
    find_Element_by_dfs(ast, "", "type" , "ContractDefinition" , find_Contracts)
    // 版本
    let contract_version = getVersion(ast)
    find_Contracts.forEach(contract_ast => {
        Contracts.push(new Contract(contract_ast,contract_version))
    });

    return Contracts
}

module.exports = ast_to_class