const express = require('express');
const app = express()
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')


require('./db/conn')



let gfs;
app.use(cors({
    origin : 'http://localhost:3000/',
    credentials: true
}))
app.use(express.json());
app.use(cookieParser())


dotenv.config({path : "./config.env"})
dotenv.config({path:'./config.env'})

app.use(require('./routes/routes'))

const user = require('./model/userSchema');

const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV == "production"){
    app.use(express.static("client/build"));
}

app.listen(PORT)