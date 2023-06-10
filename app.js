const express = require('express');
const app = express()
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser')
 

require('./db/conn')
dotenv.config({path : "./config.env"})

app.use(cors({
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
    optionsSuccessStatus: 200,
    origin: 'https://heartfelt-duckanoo-ddae4b.netlify.app',
    credentials : true
  }));

app.options('*', cors());
app.use(express.json());
app.use(cookieParser())

app.use(require('./routes/routes'))

const user = require('./model/userSchema');

const PORT = process.env.PORT || 5000;

app.listen(PORT)