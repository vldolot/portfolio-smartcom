var db = require('./dbconfig.js');
var roles = db.collection('roles');

module.exports = {

	getAllRoles: function(cb) {
	  roles.find(function(err, rec) {
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
	        str = str + ' "rolelabel" : "' + obj.rolelabel + '",' +'\n';
	        str = str + ' "rolekey" : "' + obj.rolekey + '"' +'\n';
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

	getRoleById: function(id, cb) {
	  roles.find({"_id":id}, function(err, rec) {
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
	        str = str + ' "rolelabel" : "' + obj.rolelabel + '",' +'\n';
	        str = str + ' "rolekey" : "' + obj.rolekey + '"' +'\n';
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

	getRoleByKey: function(key, cb) {
	  roles.find({"rolekey":key}, function(err, rec) {
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
	        str = str + ' "rolelabel" : "' + obj.rolelabel + '",' +'\n';
	        str = str + ' "rolekey" : "' + obj.rolekey + '"' +'\n';
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

}
