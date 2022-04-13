// 找到对应元素的上一个位置    find_element_key寻找的键值  find_element_value寻找的元素值
function find_Element_by_dfs(ast_tree , last_tree, find_element_key, find_element_value , res) {
    
    Object.keys(ast_tree).forEach(key => {
		
		// 值不为空 且如果是object 类型则继续遍历
		if(ast_tree[key] != null && typeof(ast_tree[key]) ==  "object"){
			last_tree = ast_tree[key]
			find_Element_by_dfs(ast_tree[key], last_tree , find_element_key, find_element_value  , res)
		}else{
			// 判断是否为寻找对象 ， 是的话把上个元素push 进res中
			if(find_element_key == key && ast_tree[find_element_key] == find_element_value){
				res.push(last_tree)
			}
		}
    })
}


// 版本判断
function getVersion(ast){
	
	var PragmaDirective = ast.children[0]
	if(PragmaDirective.type === "PragmaDirective"){
		version = PragmaDirective.value;
		console.log(version)
		// 格式化返回version
		if (version.indexOf("^") != -1){
			// 版本上下限
			version_min = version.substr(1)
			version_max = (parseFloat(version_min.substr(1))+ 0.1).toString() + ".00"
			return [version_min, version_max]

		}else if(version.indexOf(">") != -1 || version.indexOf("<") != -1 ){

			version_all =  version.match(/[0-9.]+/g)
			// 分情况讨论 只有一个版本号 or 两个
			if (version_all.length == 1){
				if (version.indexOf(">") != -1 ) return [version_all[0], null]
				else return [null , version_all[0]]
			}else{
				if (version_all[0] > version_all[1]) return [version_all[1], version_all[0]]
				else  return [version_all[0], version_all[1]]
			}
		}else{
			return [version, version]
		}
	}
	else
		return null
}

// 提取合约中的数学计算公式
function getMathExpress(ast){

	math_express = []
	find_element = [] 
	find_Element_by_dfs(ast, "" , "type" ,"BinaryOperation", find_element)
	// 筛选只包含+-*/ 的计算类的数学表达式
	find_element.forEach(MathExpress => {
		if (MathExpress.operator.match(/[\+\-\*\/]/) != null){
			math_express.push(MathExpress)
		}
	});

	// const  recover_express = (MathExpress) => {
	// 	MathExpress.left 
	// }
	return math_express
}


// // 提取函数的所有参数
// function getFunctionParams(ast){

// 	find_element = []
// 	find_Element_by_dfs(ast, "", "type", "VariableDeclaration", find_element)
// 	console.log(find_element)
// }

// 提取类成员或者函数参数
function getDeclareVarOrFuctionParams(arr){
	res = []
	arr.forEach(DeclareVar=>{
		let name = DeclareVar.name
		
		if (DeclareVar.typeName.hasOwnProperty('name')){
			// 单一类型
			let type_name = DeclareVar.typeName.name
			res.push({name, type_name})
		
		}else if(DeclareVar.typeName.type == "ArrayTypeName"){
			// 判断是否为数组类型
			let array_type = ""
			// 判断是否为用户定义类型
			if (DeclareVar.typeName.baseTypeName.type == "UserDefinedTypeName"){
				array_type = DeclareVar.typeName.baseTypeName.namePath
			}else{
				array_type = DeclareVar.typeName.baseTypeName.name
			}
			let type_name = "Array"
			res.push( {name , type_name, array_type} )

		}else if(DeclareVar.typeName.type == "Mapping"){
			// map 类型
			let type_name = "Mapping"
			let key_type = ""
			let value_type = ""
			// 判断是否为用户定义类型
			if(DeclareVar.typeName.keyType.type == "UserDefinedTypeName"){
				key_type = DeclareVar.typeName.keyType.namePath
			}else{
				key_type = DeclareVar.typeName.keyType.name
			}

			if(DeclareVar.typeName.valueType.type == "UserDefinedTypeName"){
				value_type = DeclareVar.typeName.valueType.namePath
			}else{
				value_type = DeclareVar.typeName.valueType.name
			}
			res.push( {name , type_name,  key_type ,value_type} )
		}
	})

	return res
}

module.exports.find_Element_by_dfs = find_Element_by_dfs
module.exports.getVersion = getVersion
module.exports.getMathExpress = getMathExpress
//module.exports.getFunctionParams = getFunctionParams
module.exports.getDeclareVarOrFuctionParams = getDeclareVarOrFuctionParams