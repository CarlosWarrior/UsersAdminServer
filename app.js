require('dotenv').config()
const {readFileSync} = require('fs')
const express = require('express')
const app = express()
app.use(require('helmet')({
  contentSecurityPolicy:{
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:',],
  
      fontSrc: ["'self'", 'https:', 'data:', "'unsafe-inline'"],
  
      scriptSrc: ["'self'",'https:', "'unsafe-inline'"],
  
      scriptSrcElem: ["'self'",'https:','https:', "'unsafe-inline'"],
  
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
  
      connectSrc: ["'self'", 'data','https:']
    },
  }
}))
app.use(require('cors')({origin:'*'}))
app.use(express.json())
app.use(express.urlencoded( {extended: true} ))
const router = require('./src/routes')
app.use('/', router.Public)
app.use('/', router.App)

const db = require('./db')
require('./src/models')
db.sync()


async function init(){
  const {User} = require("./src/models")
  const admin = await User.findOne({where:{admin:true}})
  if(!admin){
    await User.create({
      username: "admin",
      password: require("./src/crypto").hash(process.env.admin_password),
      admin: true 
    })
    console.log("Admin user created")
  }
  console.log('app running on port '+process.env.port_app)
}

if(process.env.production){
  let ssl = {
    key: readFileSync("./storage/keys/private.key"),
    cert: readFileSync("./storage/keys/public.crt"),
  }
  require('https')
    .createServer(ssl, app)
    .listen(process.env.port_app, init)
}
else  process.env.host?  require('http').createServer(app).listen(process.env.port_app, process.env.host, init) : require('http').createServer(app).listen(process.env.port_app, 	init)