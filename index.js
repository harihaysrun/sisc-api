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

async function getDBname(){
    await MongoUtil.connect(MONGO_URI,  "skincare_api");
    // console.log("getting skincare_api database")
}

getDBname();

app.get('/', function(req,res){
    // res.send('hello there')
    res.render('index');
})

app.get('/skincare-products', async function(req,res){
    const db = MongoUtil.getDB();
    let skincareProducts = await db.collection('skincare_products');

    res.render('skincare-products', {
        'skincareProducts': skincareProducts
    });
    res.render('skincare-products');
})

app.get('/skincare-products/add'), function(req,res){
    res.render('add-skincare-product');
}

app.listen(3000, function(){
    console.log("server has started")
})