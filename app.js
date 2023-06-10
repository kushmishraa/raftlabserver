const express = require('express');
const app = express()
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

require('./db/conn')
dotenv.config({path : "./config.env"})
let gfs;
app.use(cors({
    origin :"https://6483c8152c003b00b8beaaab--funny-phoenix-352142.netlify.app" ,
    credentials: false
}))
app.use((req, res, next) => {
    res.header({"Access-Control-Allow-Origin": "https://6483c8152c003b00b8beaaab--funny-phoenix-352142.netlify.app"});
    next();
  }) 
app.use(express.json());
app.use(cookieParser())

app.use(require('./routes/routes'))

const user = require('./model/userSchema');

const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV == "production"){
    app.use(express.static("client/build"));
}

app.listen(PORT)