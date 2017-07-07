var db = require('./dbconfig.js');
var groups = db.collection('groups');

module.exports = {

	getAllGroups: function(cb) {
	  groups.find({}).sort({_id: 1}, function(err, rec) {
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
	        str = str + ' "label" : "' + obj.label + '",' +'\n';
	        str = str + ' "description" : "' + obj.description + '",' +'\n';
	        str = str + ' "level" : "' + obj.level + '",' +'\n';
	        str = str + ' "parentid" : "' + obj.parentid + '",' +'\n';
	        str = str + ' "relationships" : ' + JSON.stringify(obj.relationships) + ',' +'\n';
	        str = str + ' "profile_fields" : [' + obj.profile_fields + ']' +'\n';
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

	getGroupById: function(id, cb) {
	  groups.find({_id:id}, function(err, rec) {
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
	        str = str + ' "label" : "' + obj.label + '",' +'\n';
	        str = str + ' "description" : "' + obj.description + '",' +'\n';
	        str = str + ' "level" : "' + obj.level + '",' +'\n';
	        str = str + ' "parentid" : "' + obj.parentid + '",' +'\n';
	        str = str + ' "relationships" : ' + JSON.stringify(obj.relationships) + ',' +'\n';
	        str = str + ' "profile_fields" : [' + obj.profile_fields + ']' +'\n';
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

	getGroupByLevel: function(level, cb) {
	  groups.find({"level":level}).sort({_id: 1}, function(err, rec) {
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
	        str = str + ' "label" : "' + obj.label + '",' +'\n';
	        str = str + ' "description" : "' + obj.description + '",' +'\n';
	        str = str + ' "level" : "' + obj.level + '",' +'\n';
	        str = str + ' "parentid" : "' + obj.parentid + '",' +'\n';
	        str = str + ' "relationships" : ' + JSON.stringify(obj.relationships) + ',' +'\n';
	        str = str + ' "profile_fields" : [' + obj.profile_fields + ']' +'\n';
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

	getGroupByParentId: function(parentid, cb) {
	  groups.find({"parentid":parentid}).sort({_id: 1}, function(err, rec) {
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
	        str = str + ' "label" : "' + obj.label + '",' +'\n';
	        str = str + ' "description" : "' + obj.description + '",' +'\n';
	        str = str + ' "level" : "' + obj.level + '",' +'\n';
	        str = str + ' "parentid" : "' + obj.parentid + '",' +'\n';
	        str = str + ' "relationships" : ' + JSON.stringify(obj.relationships) + ',' +'\n';
	        str = str + ' "profile_fields" : [' + obj.profile_fields + ']' +'\n';
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

	insertGroup: function(jsonVar, cb) {
		var jsonData = JSON.parse(jsonVar);

	  groups.insert({
	  	_id: 						jsonData._id,
	  	label: 					jsonData.label,
	  	description: 		jsonData.description,
	  	level: 					jsonData.level,
	  	parentid: 			jsonData.parentid,
	  	relationships: 	[],
	  	profile_fields: []
	  }, function(err, saved) {
	  	if( err || !saved ) {
				return cb(err,'Internal Server Error');
	  	} else {
				return cb(null,JSON.stringify(saved));
	  	}
	  });
	},

	updateGroupInfo: function(jsonVar, cb) {
		var jsonData = JSON.parse(jsonVar);

	  groups.update(
		  { _id: jsonData._id },
		  {
		  	$set: {
			  	label: 					jsonData.label,
			  	description: 		jsonData.description,
		  	}
		  }, 
		function(err, saved) {
	  	if( err || !saved ) {
				return cb(err,'Internal Server Error');
	  	} else {
				return cb(null,JSON.stringify(saved));
	  	}
	  });
	}

}
