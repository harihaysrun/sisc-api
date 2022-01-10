const express = require ('express');
const hbs = require ('hbs');

const app = express();

app.set('view engine', 'hbs');

app.use(express.static('public'));

// to submit form
app.use(express.urlencoded({
    extended:false
}))

require('dotenv').config();

const ObjectId = require('mongodb').ObjectId;
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
    let skincareProducts = await db.collection('skincare_products').find().toArray();

    res.render('skincare-products', {
        'skincareProducts': skincareProducts
    });
})

app.get('/skincare-products/add', function(req,res){
    res.render('add-skincare-product');
})

app.post('/skincare-products/add', async function(req,res){
    
    // let {productName} = req.body;
    let productBrand = req.body.productBrand;
    let productName = req.body.productName;

    let productToAdd = {
        'productBrand': productBrand,
        'productName': productName
    };

    const db = MongoUtil.getDB();
    await db.collection('skincare_products').insertOne(productToAdd);
    res.redirect('/skincare-products');
})

app.get('/skincare-products/:id', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();
    let productToDisplay = await db.collection('skincare_products').findOne({
        '_id': ObjectId(id)
    })

    res.render('skincare-product-info',{
        'skincareProduct': productToDisplay
    });
})

app.get('/skincare-products/:id/edit', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();
    let productToEdit = await db.collection('skincare_products').findOne({
        '_id': ObjectId(id)
    })

    res.render('edit-skincare-product',{
        'skincareProduct': productToEdit
    });
})

app.post('/skincare-products/:id/edit', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();

    let updateProductInfo = {
        'productBrand': req.body.productBrand,
        'productName': req.body.productName
    }

    await db.collection('skincare_products').updateOne({
        '_id': ObjectId(id)
    }, {
        '$set': updateProductInfo
    });

    res.redirect('/skincare-products/' + id);
})

app.get('/skincare-products/:id/delete', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();
    let productToDelete = await db.collection('skincare_products').findOne({
        '_id': ObjectId(id)
    });

    // await db.collection('skincare_products').deleteOne({
    //     '_id': ObjectId(id)
    // })

    // res.render('edit-skincare-product');

    res.render('delete-skincare-product',{
        'skincareProduct': productToDelete
    });
})

app.post('/skincare-products/:id/delete', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();

    await db.collection('skincare_products').deleteOne({
        '_id': ObjectId(id)
    })

    res.redirect('/skincare-products');

})

app.listen(3000, function(){
    console.log("server has started")
})