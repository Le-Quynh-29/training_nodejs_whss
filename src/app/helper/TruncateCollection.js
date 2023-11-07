require('dotenv').config();
const { MongoClient } = require('mongodb');

async function truncateCollection(collectionName) {
  const client = new MongoClient(process.env.DB_CONNECTION + '://' + process.env.DB_HOST + ':' + process.env.DB_PORT,
    { 
      useNewUrlParser: true,
      useUnifiedTopology: true, 
    });
  await client.connect();
  const db = client.db(process.env.DB_DATABASE);
  const collection = db.collection(collectionName);
  await collection.deleteMany({});
  console.log('truncated collection');
}

module.exports = truncateCollection;