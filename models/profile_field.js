// profile_field.js

var mongoose     = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var Schema       = mongoose.Schema;

var ProfileFieldSchema   = new Schema(
	{
    _id : {type: Number, required: true},
    type : String,
    label : String,
    model : String,
    is_required : Boolean,
    is_default : Boolean
	}
);

ProfileFieldSchema.plugin(autoIncrement.plugin, {model: 'ProfileField', field: '_id'});
module.exports = mongoose.model('ProfileField', ProfileFieldSchema);