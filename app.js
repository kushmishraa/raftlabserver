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
    origin : process.env.BASEURL,
    credentials: true
}))
app.use(express.json());
app.use(cookieParser())

app.use(require('./routes/routes'))

const user = require('./model/userSchema');

const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV == "production"){
    app.use(express.static("client/build"));
}

app.listen(PORT)