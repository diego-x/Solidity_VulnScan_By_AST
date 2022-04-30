const fs = require("fs")
const { find_Element_by_dfs } = require("./lib")

class Vuln_to_html{

    constructor(vuln, Contract_File){
        this.vuln = vuln
        this.contract_code = fs.readFileSync(Contract_File,"utf8")
        this.outPutHtml = "output/test.html"
        this.outputData = fs.readFileSync("output/model.html","utf8")
    }

    find_code_by_loc(loc){

        let contract_code = this.contract_code.split("\n")
        // 漏洞位置
        let vuln_code = ""
        if(loc.start.line == loc.end.line){
            vuln_code = contract_code[loc.start.line-1]
        }else{
            for(let i= loc.start.line; i <= loc.end.line; i++){
                vuln_code += contract_code[i-1] + "\n"
            }
        }
        return vuln_code        
    }


    getReport(){
        // 放入智能合约代码
        this.outputData = this.outputData.replace('{solidity_code}',this.contract_code )

        //获取漏洞详情
        let vuln_info = ""
        let vuln_info_overFlow = "<h2>溢出漏洞</h2>\n\n"
        let vuln_info_tx_origin = "<h2>tx.origin依赖漏洞</h2>\n\n"
        this.vuln.forEach(vuln => {
            if(vuln.type == "overFlow"){
                let code = " " + this.find_code_by_loc(vuln.vuln_loc).trim()
                let link = ""
                // 判断污点位于哪个链
                vuln.vuln_info.forEach(link1 =>{
                    let spot_link = link1.split(" -> ")
                    for(let spot of spot_link){
                        if(code.indexOf(spot) != -1){
                            link = link1.split(spot)[0] + spot
                        }
                    }
                })
                let main_spot = link.split(" -> ")[0]
                let vuln_msg =  `合约<font color="red" size="4">${vuln.Contract}</font> 函数<font color="red" size="4">${vuln.Funtion}</font> ` +
                `行<font color="red" size="4">${vuln.vuln_loc.start.line}</font> 传入的参数 <font color="red" size="4">${main_spot}</font> 直接或间接参与数学运算 <font color="red" size="4">污染链(${link})</font>` + 
                `, 同时没有采用<font color="red" size="4">SafeMath</font>库`
                vuln_info_overFlow += `${vuln_msg}\n<pre><font size="4"><code>${code}<code></font></pre><br>`

            }else if(vuln.type == "tx.origin"){
                let code = " " + this.find_code_by_loc(vuln.vuln_loc).trim()
                let vuln_msg = `合约<font color="red" size="4">${vuln.Contract}</font>  行<font color="red" size="4">${vuln.vuln_loc.start.line}</font>` + 
                `使用 <font color="red" size="4">tx.origin </font> 来进行判断，可能存在依赖漏洞`
                vuln_info_tx_origin += `${vuln_msg}\n<pre><font size="4"><code>${code}<code></font></pre><br>`
            }
        });

        vuln_info = vuln_info_overFlow + vuln_info_tx_origin
        this.outputData = this.outputData.replace('{vuln_info}',vuln_info)

        fs.writeFileSync(this.outPutHtml, this.outputData)

    }
}



module.exports.Vuln_to_html = Vuln_to_html