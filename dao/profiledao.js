//profiledao
var db = require('./dbconfig.js');
var profiles = db.collection('profiles');

module.exports = {

	getAllProfiles: function(cb) {
	  profiles.find(function(err, rec) {
			if( err || !rec) 
			   return cb(err,'Internal Server Error');
			else 
			{
				if (rec == '')
					return cb(null,JSON.stringify("[]"));
				str='['+'\n';
				rec.forEach( function(obj, index) {
					str = str + '{ '+'\n';
	        str = str + ' "_id" : "' + obj._id + '",' +'\n';
	        str = str + ' "type" : "' + obj.type + '",' +'\n';
	        str = str + ' "label" : "' + obj.label + '",' +'\n';
	        str = str + ' "model" : "' + obj.model + '",' +'\n';
	        str = str + ' "is_required" : "' + obj.is_required + '",' +'\n';
	        str = str + ' "is_default" : "' + obj.is_default + '"' +'\n';
	        if (index == rec.length) str = str + '} '+'\n';
	        else str = str + '}, '+'\n';
				});
				str = str.trim();
				str = str.substring(0,str.length-1);
				str = str +'\n'+ ']';

				return cb(null,JSON.stringify(str));
			}
	  });
	},

	getProfileById: function(ids, cb) {
		var _ids;
		if (ids.length > 1){
			for(var i=0; i<ids.length;i++) { ids[i] = +ids[i]; }
			_ids = ids;
		} else {
			_ids = Number(ids);
		}
		console.log(_ids);

	  profiles.find({_id: { $in: _ids}}, function(err, rec) {
			if( err || !rec) 
			   return cb(err,'Internal Server Error');
			else 
			{
				if (rec == '')
					return cb(null,JSON.stringify("[]"));
				str='['+'\n';
				rec.forEach( function(obj, index) {
					str = str + '{ '+'\n';
	        str = str + ' "_id" : "' + obj._id + '",' +'\n';
	        str = str + ' "type" : "' + obj.type + '",' +'\n';
	        str = str + ' "label" : "' + obj.label + '",' +'\n';
	        str = str + ' "model" : "' + obj.model + '",' +'\n';
	        str = str + ' "is_required" : "' + obj.is_required + '",' +'\n';
	        str = str + ' "is_default" : "' + obj.is_default + '"' +'\n';
	        if (index == rec.length) str = str + '} '+'\n';
	        else str = str + '}, '+'\n';
				});
				str = str.trim();
				str = str.substring(0,str.length-1);
				str = str +'\n'+ ']';

				return cb(null,JSON.stringify(str));
			}
	  });
	},

	getProfileByModel: function(model, cb) {
	  profiles.find({model:model}, function(err, rec) {
			if( err || !rec) 
			   return cb(err,'Internal Server Error');
			else 
			{
				if (rec == '')
					return cb(null,JSON.stringify("[]"));
				str='['+'\n';
				rec.forEach( function(obj, index) {
					str = str + '{ '+'\n';
	        str = str + ' "_id" : "' + obj._id + '",' +'\n';
	        str = str + ' "type" : "' + obj.type + '",' +'\n';
	        str = str + ' "label" : "' + obj.label + '",' +'\n';
	        str = str + ' "model" : "' + obj.model + '",' +'\n';
	        str = str + ' "is_required" : "' + obj.is_required + '",' +'\n';
	        str = str + ' "is_default" : "' + obj.is_default + '"' +'\n';
	        if (index == rec.length) str = str + '} '+'\n';
	        else str = str + '}, '+'\n';
				});
				str = str.trim();
				str = str.substring(0,str.length-1);
				str = str +'\n'+ ']';

				return cb(null,JSON.stringify(str));
			}
	  });
	},

	insertProfileField: function(jsonVar, cb) {
		var jsonData = JSON.parse(jsonVar);

	  profiles.save({
	  	_id: jsonData._id,
	  	type: jsonData.type,
	  	label: jsonData.label,
	  	model: jsonData.model,
	  	is_required: jsonData.is_required,
	  	is_default: jsonData.is_default
	  }, function(err, saved) {
	  	if( err || !saved ) {
				return cb(err,'Internal Server Error');
	  	} else {
				return cb(null,JSON.stringify(saved));
	  	}
	  });
	}

}
