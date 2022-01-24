const express = require ('express');
const hbs = require ('hbs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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
    res.json(skincareProducts);
    // res.render('skincare-products', {
    //     'skincareProducts': skincareProducts
    // });
})

app.get('/skincare-products/add', function(req,res){
    // let r = await db.collection('skincare_products').findOne({
        // _id: new ObjectId(req.params.id)
    // });
    // res.json(r);
    // res.render('add-skincare-product');
})

app.post('/skincare-products', async function(req,res){
    
    // let productBrand = req.body.productBrand;
    // let productName = req.body.productName;
    // let productImage = req.body.productImage;
    // let productType = req.body.productType;
    // let productSize = req.body.productSize;
    // let productDescription = req.body.productDescription;
    // let skinType = req.body.skinType;

    // let productToAdd = {
    //     'productBrand': productBrand,
    //     'productName': productName,
    //     'productImage': productImage,
    //     'productType': productType,
    //     'productSize': productSize,
    //     'productDescription': productDescription,
    //     'skinType': skinType
    // };

    // let productToAdd = {
    //     'productBrand': req.body.product_brand,
    //     'productName': req.body.product_name,
    //     'productImage': req.body.product_image,
    //     'productType': req.body.product_size,
    //     'productSize': req.body.product_size_ml,
    //     'productDescription': req.body.product_description,
    //     'skinType': req.body.skin_type
    // }

    const db = MongoUtil.getDB();
    let newProduct = await db.collection('skincare_products').insertOne({
        'listingType': req.body.listingType,
        'productCondition': req.body.productCondition,
        'productBrand': req.body.productBrand,
        'productName': req.body.productName,
        'productImage': req.body.productImage,
        'productQuantity': req.body.productQuantity,
        'productQuantityBox': req.body.productQuantityBox,
        'productType': req.body.productType,
        'productSize': req.body.productSize,
        'productPrice': req.body.productPrice,
        'productPriceDollars': req.body.productPriceDollars,
        'productDescription': req.body.productDescription,
        'skinType': req.body.skinType,
        'skinConcerns': req.body.skinConcerns,
        'productVegan': req.body.productVegan,
        'productCrueltyFree': req.body.productCrueltyFree,
    });

    res.json(newProduct.ops);

})

app.get('/skincare-products/:id', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();
    let productToDisplay = await db.collection('skincare_products').findOne({
        // '_id': ObjectId(id)
        '_id': new ObjectId(id)
    })


    res.json(productToDisplay);

    // res.render('skincare-product-info',{
    //     'skincareProduct': productToDisplay
    // });
})

// comment section
app.post('/skincare-products/:id/comment/add', async function(req,res){
    let id = req.params.id;
    const db = MongoUtil.getDB();
    // let replyTo;
    // let commentText = req.body.commentText.split(" ");
    // commentText[0].innerHTML = `<b style="background-color:azure">` + commentText[0] + `</b>`;=
    // commentText = commentText.join(" ")
    
    // let commentText = req.body.commentText;
    // let replyTo = commentText.split(/ (.*)/);
    // replyTo[0].style.color = "pink";

    await db.collection('skincare_products').updateOne({
        '_id': new ObjectId(id),
    },{
        '$push':{
            'comments':{
                '_id': new ObjectId(),
                'commentName': req.body.commentName,
                'commentText': req.body.commentText
            }
        }
    })
})

// delete comment
app.post('/skincare-products/:id/comment/delete', async function(req,res){
    let id = req.params.id;
    let commentId = req.body.commentId;
    const db = MongoUtil.getDB();
    await db.collection('skincare_products').updateOne({
        '_id': new ObjectId(id),
    },{
        '$pull':{
            'comments':{
                '_id': new ObjectId(commentId)
            }
        }
    })
})

app.patch('/skincare-products/:id', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();
    await db.collection('skincare_products').updateOne({
        '_id': new ObjectId(id),
    },{
        '$set':{
            'listingType': req.body.listingType,
            'productCondition': req.body.productCondition,
            'productBrand': req.body.productBrand,
            'productName': req.body.productName,
            'productImage': req.body.productImage,
            'productQuantity': req.body.productQuantity,
            'productQuantityBox': req.body.productQuantityBox,
            'productType': req.body.productType,
            'productSize': req.body.productSize,
            'productPrice': req.body.productPrice,
            'productPriceDollars': req.body.productPriceDollars,
            'productDescription': req.body.productDescription,
            'skinType': req.body.skinType,
            'skinConcerns': req.body.skinConcerns,
            'productVegan': req.body.productVegan,
            'productCrueltyFree': req.body.productCrueltyFree
        }
    });

    // res.json(newProduct.ops);

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
        'productName': req.body.productName,
        'productImage': req.body.productImage,
        'productType': req.body.productType,
        'productSize': req.body.productSize,
        'productDescription': req.body.productDescription,
        'skinType': req.body.skinType
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
    // let productToDelete = await db.collection('skincare_products').findOne({
    //     '_id': ObjectId(id)
    // });

    await db.collection('skincare_products').deleteOne({
        '_id': ObjectId(id)
    })

    // res.render('edit-skincare-product');

    // res.render('delete-skincare-product',{
    //     'skincareProduct': productToDelete
    // });
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