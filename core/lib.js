var parser = require("solidity-parser-antlr")
// 找到对应元素的上一个位置    find_element_key寻找的键值  find_element_value寻找的元素值
// value_is_object 0 时 key为字符串类型 ， 1时key为复杂类型，即子树
function find_Element_by_dfs(ast_tree, last_tree, find_element_key, find_element_value, res, value_is_object = 0) {

    Object.keys(ast_tree).forEach(key => {
        // 值不为空 且如果是object 类型则继续遍历
        if (ast_tree[key] != null && typeof (ast_tree[key]) == "object" && !(value_is_object == 1 && Object.keys(
                ast_tree).indexOf(find_element_key))) {
            // 指向上一个节点
            last_tree = ast_tree[key]
            find_Element_by_dfs(ast_tree[key], last_tree, find_element_key, find_element_value, res)
        } else {
            // 判断是否为寻找对象 ， 是的话把上个元素push 进res中
            if (value_is_object == 0) {
                if (find_element_key == key && ast_tree[find_element_key] == find_element_value) {
                    // 判断上个树中是否包含查找元素
                    if (last_tree != "" && last_tree[find_element_key] == find_element_value) {
                        res.push(last_tree)
                    } else {
                        res.push(ast_tree)
                    }
                }
            } else {
                // 如果value为复杂类型 则转化为字符串比较
                if (ast_tree[find_element_key] != undefined) {
                    tmp = JSON.parse(JSON.stringify(ast_tree[find_element_key])) //深拷贝
                    delete_loc_by_dfs(tmp) // 删除loc
                    let stringify = JSON.stringify(tmp)

                    if (find_element_key == key && stringify == find_element_value) {
                        if (last_tree == "") {
                            res.push(ast_tree)
                        } else {
                            res.push(last_tree)
                        }
                    }
                }
                // 递归
                if (ast_tree[key] != null && typeof (ast_tree[key]) == "object") {
                    last_tree = ast_tree[key]
                    find_Element_by_dfs(ast_tree[key], last_tree, find_element_key, find_element_value, res, 1)
                }
            }
        }
    })
}

// 查找loc 并删除 ， 在比较的时候使用
function delete_loc_by_dfs(tree) {

	Object.keys(tree).forEach(key => {
		if (key == "loc") {
			delete tree[key]
		}
		if (typeof (tree[key]) == "object" && tree[key] != null) {
			delete_loc_by_dfs(tree[key])
		}
	})
}

//  根据loc找代码
function find_code_by_loc(loc, code , only_line = 1) {

	let contract_code = code.split("\n")
	// 漏洞位置
	let vuln_code = ""
	// 只需要返回行
	if(only_line == 1){
		if (loc.start.line == loc.end.line) {
			vuln_code = contract_code[loc.start.line - 1]
		} else {
			for (let i = loc.start.line; i <= loc.end.line; i++) {
				vuln_code += contract_code[i - 1] + "\n"
			}
		}
	}else{
		//返回具体代码
		if (loc.start.line == loc.end.line) {
			vuln_code = contract_code[loc.start.line - 1].substring(loc.start.column, loc.end.column+1)
		}
	}
	
	return vuln_code
}

// 版本判断
function getVersion(ast) {

	var PragmaDirective = ast.children[0]
	if (PragmaDirective.type === "PragmaDirective") {
		version = PragmaDirective.value;
		//console.log(version)
		// 格式化返回version
		if (version.indexOf("^") != -1) {
			// 版本上下限
			version_min = version.substr(1)
			version_max = (parseFloat(version_min.substr(1)) + 0.1).toString() + ".00"
			return [version_min, version_max]

		} else if (version.indexOf(">") != -1 || version.indexOf("<") != -1) {

			version_all = version.match(/[0-9.]+/g)
			// 分情况讨论 只有一个版本号 or 两个
			if (version_all.length == 1) {
				if (version.indexOf(">") != -1) return [version_all[0], null]
				else return [null, version_all[0]]
			} else {
				if (version_all[0] > version_all[1]) return [version_all[1], version_all[0]]
				else return [version_all[0], version_all[1]]
			}
		} else {
			return [version, version]
		}
	} else
		return null
}

// 提取合约中的数学计算公式
function getMathExpress(ast) {

	math_express = []
	find_element = []
	find_Element_by_dfs(ast, "", "type", "BinaryOperation", find_element)
	// 筛选存在数学运算的复制表达式  
	find_element.forEach(MathExpress => {
		if ( MathExpress.operator.match(/([\!\>\<])|(==)/) == null && MathExpress.operator.match(/=/) != null
				&& ( MathExpress.operator.length == 2 || MathExpress.right.type == "BinaryOperation"))  {
			math_express.push(MathExpress)
		}
	});

	return math_express
}


// 提取类成员或者函数参数
function getDeclareVarOrFuctionParams(arr) {
	res = []
	arr.forEach(DeclareVar => {
		let name = DeclareVar.name

		if (DeclareVar.typeName.hasOwnProperty('name')) {
			// 单一类型
			let type_name = DeclareVar.typeName.name
			res.push({
				name,
				type_name
			})

		} else if (DeclareVar.typeName.type == "ArrayTypeName") {
			// 判断是否为数组类型
			let array_type = ""
			// 判断是否为用户定义类型
			if (DeclareVar.typeName.baseTypeName.type == "UserDefinedTypeName") {
				array_type = DeclareVar.typeName.baseTypeName.namePath
			} else {
				array_type = DeclareVar.typeName.baseTypeName.name
			}
			let type_name = "Array"
			res.push({
				name,
				type_name,
				array_type
			})

		} else if (DeclareVar.typeName.type == "Mapping") {
			// map 类型
			let type_name = "Mapping"
			let key_type = ""
			let value_type = ""
			// 判断是否为用户定义类型
			if (DeclareVar.typeName.keyType.type == "UserDefinedTypeName") {
				key_type = DeclareVar.typeName.keyType.namePath
			} else {
				key_type = DeclareVar.typeName.keyType.name
			}

			if (DeclareVar.typeName.valueType.type == "UserDefinedTypeName") {
				value_type = DeclareVar.typeName.valueType.namePath
			} else {
				value_type = DeclareVar.typeName.valueType.name
			}
			res.push({
				name,
				type_name,
				key_type,
				value_type
			})
		}
	})

	return res
}

// 基于loc排序
function sort_by_loc(arr){

	let len = arr.length
	for(var i = 0; i < len -1 ; i++){
		for(var j = i+1 ; j < len ; j++){
			if (arr[j].loc.start.line < arr[i].loc.start.line) {        // 相邻元素两两对比
                var temp = arr[j];        // 元素交换
                arr[j] = arr[i];
                arr[i] = temp;
            }
		}
	}
	return arr
}

// 判断函数是否采用了安全的计算方式
function is_safe_math(mathexpress, overflow_uncheck_list){
	
	let math_express_stringify = JSON.stringify(mathexpress)

	if (math_express_stringify.match(/safemath/i) != null) {
		return false // 安全
	}else {
		// 检查表达式中是否包含 安全函数
		let FunctionCall = []
		let memberName = []
		let check_list = overflow_uncheck_list

		find_Element_by_dfs(mathexpress, "" , "type" , "FunctionCall" , FunctionCall)

		for(let check of check_list){
			find_Element_by_dfs(mathexpress, "" , "memberName" , check , memberName)
		}
		if(memberName.length != 0) return false
	}

	return true
}

// 将代码转成ast
function code_to_ast(code){

  sandbox = `contract test{
      function test(){
          ${code};
      }
  }`
  res = parser.parse(sandbox)
  result = res.children[0].subNodes[0].body.statements[0].expression

  return result
}

module.exports.find_Element_by_dfs = find_Element_by_dfs
module.exports.getVersion = getVersion
module.exports.getMathExpress = getMathExpress
module.exports.delete_loc_by_dfs = delete_loc_by_dfs
module.exports.getDeclareVarOrFuctionParams = getDeclareVarOrFuctionParams
module.exports.find_code_by_loc = find_code_by_loc
module.exports.sort_by_loc = sort_by_loc
module.exports.is_safe_math = is_safe_math
module.exports.code_to_ast = code_to_ast