const fs = require('fs')
const os = require('os')
const path = require('path')
const express = require('express')
const child_process = require('child_process')
const multer = require('multer')
const bodyParser = require('body-parser')

const HTTP_PORT = 5566
const WORK_DIR = path.dirname(__filename)
const SCRIPTS_DIR = path.join(WORK_DIR, "Scripts")

const app = express()
const upload = multer({
  dest: os.tmpdir()
})
app.use(upload.any())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

app.get("/", (req, res) => {
  let html = fs.readFileSync(path.join(WORK_DIR, "guide.html")).toString()
  let js = fs.readFileSync(path.join(WORK_DIR, "install-runtime.js")).toString()
  const replacer = new RegExp('@@host@@', 'g')
  js = js.replace(replacer,_host)
  html = html.replace("@@code@@", js)
  html = html.replace("@@scriptUrl@@", encodeURIComponent(_host+"/Dist/Weather-Lambdaexpression.scriptable"))
  res.send(html)
})

app.get('/ping', (req, res) => {
  console.log('[-] ping..')
  setTimeout(() => {
    res.send("pong").end()
  }, 1000)
})

let FILE_DATE = null
let IS_FIRST=true

app.get('/sync', (req, res) => {
  // console.log('[-] 等待同步到手机..')
  const { name } = req.query

  const WIDGET_FILE = path.join(SCRIPTS_DIR, name + '.js')
  if (!fs.existsSync(WIDGET_FILE)) return res.send("nofile").end()

  setTimeout(() => {
    const _time = fs.statSync(WIDGET_FILE).mtimeMs
    // 首次一定同步文件
    if (IS_FIRST) {
      IS_FIRST = false
      // 同步
      res.sendFile(WIDGET_FILE)
      console.log('[+] 同步到手机完毕')
      FILE_DATE = _time
    } else {

      // 判断文件时间
      if (_time === FILE_DATE) {
        res.send("no").end()
        return
        // return console.log("[!] 文件没有更改，不同步")
      }

      // 同步
      res.sendFile(WIDGET_FILE)
      console.log('[+] 同步到手机完毕')
      FILE_DATE = _time
    }

  }, 1000)
})


app.post("/sync", (req, res) => {
  if (req.files.length !== 1) return res.send("no")
  console.log('[+] Scriptalbe App 已连接')
  const _file = req.files[0]
  const FILE_NAME = _file['originalname'] + '.js'
  const WIDGET_FILE = path.join(SCRIPTS_DIR, FILE_NAME)
  console.log(WIDGET_FILE)
  console.log(_file['path'])
  // fs.renameSync(_file['path'], WIDGET_FILE)
  res.send("ok")
  console.log(`[*] 小组件源码（${_file['originalname']}）已同步，请打开编辑`)
  FILE_DATE = fs.statSync(WIDGET_FILE).mtimeMs
  // 尝试打开
  // let cmd = `code "${WIDGET_FILE}"`
  // if (os.platform() === "win32") {
  //   cmd = `cmd.exe /c ${cmd}`
  // } else if (os.platform() === "linux") {
  //   let shell = process.env["SHELL"]
  //   cmd = `${shell} -c ${cmd}`
  // } else {
  //   // cmd = `"/Users/meizu/Documents/code/github/LambdaExpression/Scriptables/Scripts" "${WIDGET_FILE}"`
  //   cmd = `"echo" "${WIDGET_FILE}"`
  //
  // }
  // child_process.execSync(cmd)
})

// 远程 console，调试中把调试输出内容传送到服务端控制台输出
app.post('/console', (req, res) => {
  const { t, data } = req.body
  const _time =  new Date().toLocaleString().split(' ')[1]
  switch (t) {
    case 'warn':
      console.warn(`[console.warn / ${_time}]`, typeof data === 'string' ? data : '')
      if (typeof data === 'object') console.warn(data)
      break
    case 'error':
      console.error(`[console.error / ${_time}]`, typeof data === 'string' ? data : '')
      if (typeof data === 'object') console.error(data)
      break
    default:
      console.log(`[console.log / ${_time}]`, typeof data === 'string' ? data : '')
      if (typeof data === 'object') console.log(data)
  }
  res.send("ok")
})

app.get("/Scripts/:name", (req, res) => {
  let js = fs.readFileSync(path.join(WORK_DIR, "Scripts/"+req.params.name)).toString()
  res.header('Content-Type', 'text/javascript');
  res.send(js)
})

app.get("/Dist/:name", (req, res) => {
  let js = fs.readFileSync(path.join(WORK_DIR, "Dist/"+req.params.name)).toString()
  res.header('Content-Type', 'text/javascript');
  res.send(js)
})

// 获取当前电脑IP
function getIPAdress() {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
      var iface = interfaces[devName];
      for (var i = 0; i < iface.length; i++) {
          var alias = iface[i];
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
              return alias.address;
          }
      }
  }
}

const _ip = getIPAdress()
const _host = `http://${_ip}:${HTTP_PORT}`

console.log('[*] 「小件件」开发服务运行中')
console.log(`[-] 地址：${_host}`)
console.log(`[-] 如果你的手机还没有配置开发环境，请手机 Safari 访问上述地址，查看引导`)
console.log('[+] 如果你的手机已经安装好环境和小组件模板，请在 Scriptable 里点击小组件模板->远程开发，服务器地址输入：', _ip)
console.log('[*] 更多帮助：https://github.com/im3x/scriptables')
app.listen(HTTP_PORT)