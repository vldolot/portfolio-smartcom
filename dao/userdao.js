var db = require('./dbconfig.js');
var users = db.collection('users');

module.exports = {

	getAllUsers: function(cb) {
	  users.find(function(err, rec) {
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
	        str = str + ' "profiles" : ' + JSON.stringify(obj.profiles) + ',' +'\n';
	        str = str + ' "groups" : [' + obj.groups + ']' +'\n';
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

	getUserById: function(id, cb) {
	  users.find({"_id":id},function(err, rec) {
			if( err || !rec) 
			   return cb(err,'Internal Server Error');
			else 
			{
				//console.log('in getSingle User');
				//console.log("rec is -->>"+rec+"=====");
				if (rec == '')
					return cb(null,JSON.stringify("[]"));
				str='['+'\n';
				rec.forEach( function(obj, index) {
					str = str + '{ '+'\n';
	        str = str + ' "_id" : "' + obj._id + '",' +'\n';
	        str = str + ' "profiles" : "' + JSON.stringify(obj.profiles) + '",' +'\n';
	        str = str + ' "groups" : [' + obj.groups + ']' +'\n';
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

	getUsersByGroupIds: function(groupIds, cb) {
		var groups;
		if (groupIds.length > 1){
			for(var i=0; i<groupIds.length;i++) { groupIds[i] = +groupIds[i]; }
			groups = groupIds;
		} else {
			groups = Number(groupIds);
		}
		console.log(groups);

	  users.find({"groups":groups},function(err, rec) {
			if( err || !rec) 
			   return cb(err,'Internal Server Error');
			else 
			{
				//console.log("rec is -->>"+rec+"=====");
				if (rec == '')
					return cb(null,JSON.stringify("[]"));
				str='['+'\n';
				rec.forEach( function(obj, index) {
					str = str + '{ '+'\n';
	        str = str + ' "_id" : "' + obj._id + '",' +'\n';
	        str = str + ' "profiles" : "' + JSON.stringify(obj.profiles) + '",' +'\n';
	        str = str + ' "groups" : [' + obj.groups + ']' +'\n';
	        if (index == rec.length) str = str + '} '+'\n';
	        else str = str + '}, '+'\n';
				});
				str = str.trim();
				str = str.substring(0,str.length-1);
				str = str +'\n'+ ']';
				return cb(null,JSON.stringify(str));
			}
	  });	
	}

	/*function insertUser(jsonVar, cb) {
	  var jsonData = JSON.parse(jsonVar);
	  users.save({email: jsonData.email, password: jsonData.password, username: jsonData.username}, function(err, saved) {
	  	if( err || !saved ) 
				return cb(err,'Internal Server Error');
	  	else 
				return cb(null,JSON.stringify(saved));
	  });
	}*/

}