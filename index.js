const express = require ('express');
const hbs = require ('hbs');

const app = express();

app.set('view engine', 'hbs');

app.use(express.static('public'));

require('dotenv').config();

const MongoUtil = require('./MongoUtil');
const {ReadPreferenceMode} = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
// console.log("MONGO_URI: " + MONGO_URI);

app.get('/', function(req,res){
    // res.send('hello there')
    res.render('index');
})

app.get('/skincare-products', function(req,res){
    res.render('skincare-products');
})

app.listen(3000, function(){
    console.log("server has started")
})