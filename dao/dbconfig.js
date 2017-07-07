//process.env.MONGODB_URL = 'localhost:27017/smartcommunities';
var mongodburl = 'localhost:27017/smartcommunities';
var mongojs = require('mongojs');
var db = mongojs(mongodburl);

// DB Events

db.on('connect', function () {
  console.log('database connected')
});

db.on('error', function (err) {
  console.log('database error', err)
});

module.exports = db;