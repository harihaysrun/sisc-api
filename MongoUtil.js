const MongoClient = require('mongodb').MongoClient;

let _db;

async function connect(uri, dbname){
    let client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    })

    _db = client.db(dbname);
    console.log("database has been connected");
}

function getDB(){
    return _db;
}

module.exports = {
    connect,
    getDB
}