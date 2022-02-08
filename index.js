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

// get list of skincare products
app.get('/skincare-products', async function(req,res){
    const db = MongoUtil.getDB();
    let skincareProducts = await db.collection('skincare_products').find().toArray();
    res.json(skincareProducts);
})

console.log("hello")


// add new skincare product
app.post('/skincare-products/add', async function(req,res){
    
    const db = MongoUtil.getDB();
    let newProduct = await db.collection('skincare_products').insertOne({
        'posterName': req.body.posterName,
        'listingType': req.body.listingType,
        'productCondition': req.body.productCondition,
        'productBrand': req.body.productBrand,
        'productName': req.body.productName,
        'productImage': req.body.productImage,
        'productCategory': req.body.productCategory,
        'productCategoryOthers': req.body.productCategoryOthers,
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

// get product info
app.get('/skincare-products/:id', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();
    let productToDisplay = await db.collection('skincare_products').findOne({
        // '_id': ObjectId(id)
        '_id': new ObjectId(id)
    })
    res.json(productToDisplay);

})

// add comment
app.post('/skincare-products/:id/comment/add', async function(req,res){
    let id = req.params.id;
    const db = MongoUtil.getDB();

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

    res.sendStatus(200);
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

    res.sendStatus(200);
})

// edit skincare product
app.patch('/skincare-products/:id', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();
    await db.collection('skincare_products').updateOne({
        '_id': new ObjectId(id),
    },{
        '$set':{
            'datePosted': req.body.datePosted,
            'productCondition': req.body.productCondition,
            'productBrand': req.body.productBrand,
            'productName': req.body.productName,
            'productImage': req.body.productImage,
            'productCategory': req.body.productCategory,
            'productCategoryOthers': req.body.productCategoryOthers,
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
    
    res.sendStatus(200);

})

// // mark as sold
// app.post('/skincare-products/:id/sold', async function(req,res){

//     let id = req.params.id;
//     const db = MongoUtil.getDB();
//     await db.collection('skincare_products').updateOne({
//         '_id': new ObjectId(id),
//     },{
//         '$set':{
//             'markAsSold': req.body.markAsSold
//         }
//     });
    
//     res.sendStatus(200);

// })

// delete post
app.post('/skincare-products/:id/delete', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();

    await db.collection('skincare_products').deleteOne({
        '_id': ObjectId(id)
    })
    
    res.sendStatus(200);
})


// search
app.post('/search', async function(req,res){
    const db = MongoUtil.getDB();
    let search = await db.collection('skincare_products').find({
        '$or': [
                {'productBrand': {
                    '$regex': req.body.search, '$options': 'i'
                    }
                },
                {'productName': {
                    '$regex': req.body.search, '$options':'i'
                    }
                },
                {'productCondition': req.body.productCondition},
                {'productCategory': req.body.productCategory},
                {'productType': req.body.productType},
                {'productPrice': {
                    '$gte': 0,
                    '$lte': req.body.productPriceDollars
                    }
                },
                {'productPriceDollars': {
                    '$gte': 0,
                    '$lte': req.body.productPriceDollars
                    }
                },
                {'skinType': { 
                    '$in': [req.body.skinType]
                }},
                {'productVegan': req.body.productVegan},
                {'productCrueltyFree': req.body.productCrueltyFree},
                ]
    }).toArray();

    // console.log(results)
    res.json(search);
    // res.sendStatus(200);
    
    // const db = MongoUtil.getDB();
    // let skincareProducts = await db.collection('skincare_products').find().toArray();
    // res.json(skincareProducts);

})





// get list of requests
app.get('/requested-products', async function(req,res){
    const db = MongoUtil.getDB();
    let requestedProducts = await db.collection('requested_products').find().toArray();
    res.json(requestedProducts);
})

// request product
app.post('/requested-products/add', async function(req,res){
    
    const db = MongoUtil.getDB();
    let requestProduct = await db.collection('requested_products').insertOne({
        'posterName': req.body.posterName,
        'productBrand': req.body.productBrand,
        'productName': req.body.productName,
        'productImage': req.body.productImage,
        'productQuantity': req.body.productQuantity,
        'productQuantityBox': req.body.productQuantityBox,
        'productType': req.body.productType,
        'productSize': req.body.productSize,
        'productDescription': req.body.productDescription
    });

    res.json(requestProduct.ops);

})

// get product request info
app.get('/requested-products/:id', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();

    let productToDisplay = await db.collection('requested_products').findOne({
        '_id': new ObjectId(id)
    })
    res.json(productToDisplay);
})

// edit skincare product
app.patch('/requested-products/:id', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();
    await db.collection('requested_products').updateOne({
        '_id': new ObjectId(id),
    },{
        '$set':{
            'datePosted': req.body.datePosted,
            'productCondition': req.body.productCondition,
            'productBrand': req.body.productBrand,
            'productName': req.body.productName,
            'productImage': req.body.productImage,
            'productQuantity': req.body.productQuantity,
            'productQuantityBox': req.body.productQuantityBox,
            'productType': req.body.productType,
            'productSize': req.body.productSize,
            'productDescription': req.body.productDescription
        }
    });
    
    res.sendStatus(200);

});

// request comment section
app.post('/requested-products/:id/comment/add', async function(req,res){
    let id = req.params.id;
    const db = MongoUtil.getDB();

    await db.collection('requested_products').updateOne({
        '_id': new ObjectId(id),
    },{
        '$push':{
            'comments':{
                '_id': new ObjectId(),
                'commentName': req.body.commentName,
                'commentText': req.body.commentText,
                'commentOffer': req.body.commentOffer
            }
        }
    })
    
    res.sendStatus(200);
})

// delete comment
app.post('/requested-products/:id/comment/delete', async function(req,res){
    let id = req.params.id;
    let commentId = req.body.commentId;
    const db = MongoUtil.getDB();
    await db.collection('requested_products').updateOne({
        '_id': new ObjectId(id),
    },{
        '$pull':{
            'comments':{
                '_id': new ObjectId(commentId)
            }
        }
    })
    
    res.sendStatus(200);
})

// delete post
app.post('/requested-products/:id/delete', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();

    await db.collection('requested_products').deleteOne({
        '_id': ObjectId(id)
    })
    
    res.sendStatus(200);
})



// get products in review board
app.get('/reviews', async function(req,res){
    const db = MongoUtil.getDB();
    let reviewBoard = await db.collection('review_board').find().toArray();
    res.json(reviewBoard);
})

// add new skincare product to review board
app.post('/reviews/add', async function(req,res){
    
    const db = MongoUtil.getDB();
    let newProduct = await db.collection('review_board').insertOne({
        'productBrand': req.body.productBrand,
        'productName': req.body.productName,
        'productImage': req.body.productImage,
        'productCategory': req.body.productCategory,
        'productCategoryOthers': req.body.productCategoryOthers,
        'productVegan': req.body.productVegan,
        'productCrueltyFree': req.body.productCrueltyFree,
    });

    res.json(newProduct.ops);

})



// get product review info
app.get('/reviews/:id', async function(req,res){

    let id = req.params.id;
    const db = MongoUtil.getDB();

    let productToDisplay = await db.collection('review_board').findOne({
        '_id': new ObjectId(id)
    })
    res.json(productToDisplay);
})

// review comment section
app.post('/reviews/:id/comment/add', async function(req,res){
    let id = req.params.id;
    const db = MongoUtil.getDB();

    await db.collection('review_board').updateOne({
        '_id': new ObjectId(id),
    },{
        '$push':{
            'reviews':{
                '_id': new ObjectId(),
                'commentName': req.body.commentName,
                'age': req.body.age,
                'ageOthers': req.body.ageOthers,
                'rating': req.body.rating,
                'skinType': req.body.skinType,
                'commentText': req.body.commentText,
                'repurchase': req.body.repurchase,
            },
        },
        '$set':{
            'noOfReviews': req.body.noOfReviews
        }
    })
    
    res.sendStatus(200);
})


// delete comment
app.post('/reviews/:id/comment/delete', async function(req,res){
    let id = req.params.id;
    let commentId = req.body.commentId;
    const db = MongoUtil.getDB();
    await db.collection('review_board').updateOne({
        '_id': new ObjectId(id),
    },{
        '$pull':{
            'reviews':{
                '_id': new ObjectId(commentId)
            }
        },
        '$set':{
            'noOfReviews': req.body.noOfReviews
        }
    })
    
    res.sendStatus(200);
})


app.listen(process.env.PORT, function(){
    console.log("server has started")
})