// user.js

var mongoose     = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema(
  {
    _id : {type: Number, required: true},
    profiles : [{ model : String, value : Schema.Types.Mixed, _id: false }],
    groups : [ Number ]
  }
);

UserSchema.plugin(autoIncrement.plugin, {model: 'User', field: '_id'});
module.exports = mongoose.model('User', UserSchema);