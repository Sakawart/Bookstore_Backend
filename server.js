const express = require('express')
const core = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config();
const { readdirSync } = require('fs')
const connectDB = require('./config/db')

const app = express()

//ConnectDB
connectDB()


//middleware
app.use(morgan('dev')) //ทำให้เห็นว่าใครทำอะไรกับ api ของเรา
app.use(bodyParser.json({limit:'20mb'})) //จัดการ request ที่อยู่หลังบ้าน
app.use(core()) //การดึง api ต่างๆจากเว็บนอก 

//Route
// #1
//app.use('/api',require('./routes/api'))

// #2 map = loop อ่านไฟล์ใน routes 
readdirSync('./routes').map((r)=> app.use('/api', require('./routes/'+r)))
 


const port = process.env.PORT
app.listen(port,()=>{
    console.log("Server running "+port)
})