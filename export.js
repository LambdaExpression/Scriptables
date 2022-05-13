
const process = require('process')
const os = require('os')
const fs = require('fs')
const path = require('path')

const file_name = process.argv[2]

const out_name = file_name.replace(".js", "").replace( ".enc.js","")
// 读取源文件
const widget_file = fs.readFileSync(path.join(__dirname, file_name), 'utf8')

const data = {
    "always_run_in_app" : false,
    "icon" : {
        "color" : "red",
        "glyph" : "brain"
    },
    "name" : file_name,
    "script" : widget_file,
    "share_sheet_inputs" : [

    ]
}

fs.writeFileSync(path.join(__dirname, out_name+".scriptable"), JSON.stringify(data));
