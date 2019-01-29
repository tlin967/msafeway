const mysql = require('mysql')
const config = require('./config.js')
const connection = mysql.createConnection(config)
const http = require('http')
const path = require('path')
const fs = require('fs')
const connect = require('connect')
// const express = require('express');
const app = connect()
// const app = express();
const bodyParser = require('body-parser')
const finalhandler = require('finalhandler')
const multer = require('multer')
const passport = require('./auth.js')

const upload = multer()
const serveStatic = require('serve-static') 

const dir = path.join(__dirname, 'public')
const mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
}

const Queries = require('./queries')

const bcrypt = require('bcrypt')
const saltRounds = 10

// const cookieParser = require('cookie-parser');
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)

// const expressValidator = require('express-validator');

function html (app) {
  console.log('server starting')
  const server = http.createServer(app).listen(process.env.PORT);
  //const server = http.createServer(app).listen(8080);

}

function main () {
  // var router = Router();
  // router.use(expressValidator);

  // app.set('trust proxy', 1) // trust first proxy
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  // app.use(cookieParser());

  const sessionStore = new MySQLStore(config)
  /*
    const session = require('express-session');
    const MySQLStore = require('express-mysql-session')(session);

    */

  app.use(session({
    secret: 'keybfsdoardafsa cat',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
    // if https need set true
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  const router = require('./routes.js')

  app.use(serveStatic("js"))
  app.use(serveStatic("html"))

  app.use('/', function (req, res, next) {
    console.log('---')
    console.log(`request to ${req.url}`)
    console.log(req.session)
    next()
  })

  app.use('/', upload.none())
  // upload handles multipart/form-data submissions and creates req.body when its a file, as well as req.fields for the fields

  app.use('/', router)

  app.use('/public', function (req, res, next) {
    console.log('serving public file')
    var reqpath = req.url.toString().split('?')[0]
    // console.log(reqpath)
    var file = path.join(dir, reqpath)
    console.log(`retrieving file ${file}`)
    if (file.indexOf(dir + path.sep) !== 0) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'text/plain')
      return res.end('Forbidden')
    }
    var type = mime[path.extname(file).slice(1)] || 'text/plain'
    console.log(`filetype ${type}`)
    var s = fs.createReadStream(file)
    s.on('open', function () {
      res.setHeader('Content-Type', type)
      s.pipe(res)
    })
    s.on('error', function () {
      res.setHeader('Content-Type', 'text/plain')
      res.statusCode = 404
      res.end('Not found')
    })
  })

  html(app)
}

main()