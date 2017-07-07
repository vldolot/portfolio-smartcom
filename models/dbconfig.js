//process.env.MONGODB_URL = 'localhost:27017/smartcommunities';
var mongodburl = 'mongodb://localhost:27017/smartcommunities';
var mongoose = require('mongoose');
mongoose.connect(mongodburl);
var db = mongoose.connection;

// DB Events

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('database connected');
});

module.exports = db;
