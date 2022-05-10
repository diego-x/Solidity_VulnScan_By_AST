const express = require('express');
var bodyParser = require('body-parser');
const { parser_code } = require('./parse');
var multer = require ('multer');
var path = require('path')  ;
var fs = require("fs");

//设置上传的目录，  
var upload = multer({ dest:  path.join(__dirname,'public/upload')});
var urlencodedParser = bodyParser.urlencoded({ extended: false })


const app = express();
app.use(urlencodedParser);
// 静态目录
app.use('/public', express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});

// 漏洞扫描模块
app.post('/vuln_scan',upload.single('file_data') , (req, res) => {
    let code = fs.readFileSync( req.file["path"] , "utf8");
    let save_path =  './public/output/' + req.file["filename"] + ".html";
    let status = parser_code(code, save_path)
    if( status == "success"){
        res.send({"path" : save_path , "status": 2 , "message": "检测成功"} );
    }else{
        res.send({ "status": 0 , "message": status} );
    }
    
  });

app.listen(3000, () => {
  console.log('示例应用正在监听 3000 端口!');
});