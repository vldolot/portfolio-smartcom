// group.js

var mongoose     = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var Schema       = mongoose.Schema;

var GroupSchema   = new Schema(
	{
    _id : {type: Number, required: true},
    label : String,
    description : String,
    level : Number,
    parentid : Number,
    relationships : [{ role_group: String, values: [ Number ], profile_fields : [{ fieldid: Number, order: Number, _id: false }], _id: false }]
	}
);

GroupSchema.plugin(autoIncrement.plugin, {model: 'Group', field: '_id'});
module.exports = mongoose.model('Group', GroupSchema);