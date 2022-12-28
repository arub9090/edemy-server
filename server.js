import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import {readdirSync} from 'fs'
import mongoose from 'mongoose'
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

require("dotenv").config();
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

//create Express App New
const app= express();
app.use(cookieParser())


//Batabase connection

mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(()=> console.log('***DB COnencted***'))
.catch((err)=> console.log('DATABASE Connection Failed', err))

//setup the middleware
app.use(cors());
app.use(express.json({limit: '5mb'}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false })) 
app.use(morgan('dev'))


readdirSync('./routes').map((r)=> app.use('/api', require(`./routes/${r}`)))


app.get('/api/csrf-token',csrfProtection, function(req, res) {
    // pass the csrfToken to the view
    res.json({ csrfToken: req.csrfToken() })
  })


// port setting
const port= process.env.PORT || 8000;
app.listen(port, ()=> console.log(`Server Running on Port ${port}`))

