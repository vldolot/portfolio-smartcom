// role.js

var mongoose     = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var Schema       = mongoose.Schema;

var RoleSchema   = new Schema(
	{
    _id : {type: Number, required: true},
    rolelabel : String,
    rolekey : String,
    is_default: Boolean,
    profile_fields : [{ fieldid: Number, order: Number, _id: false }]
	}
);

RoleSchema.plugin(autoIncrement.plugin, {model: 'Role', field: '_id'});
module.exports = mongoose.model('Role', RoleSchema);