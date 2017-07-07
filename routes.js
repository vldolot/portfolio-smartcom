// module.exports = function (app) {
  var express = require("express");
  var router = express.Router();
  var port = process.env.PORT || 8080;
  var api = '';

  // Models
  var User = require('./models/user');
  var Group = require('./models/group');
  var Role = require('./models/role');
  var ProfileField = require('./models/profile_field');

  router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:" + port);
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });


  /* USERS */

  router.route(api+'/users')

    .get(function (req, res) {

      User.find(function (err, users) {
        console.log(users);
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(users);
      });
    })

    .post(function (req, res){
      //console.log(req.body.jsonData);
      var jsonData = JSON.parse(req.body.jsonData);
      var user = new User();

      //user._id = (new mongoose.Types.ObjectId).toString();
      user.profiles = jsonData.profiles;
      user.groups = jsonData.groups;

      user.save(function (err){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json({ message: '1 User created.', newId: user._id });
      });
    });

  router.route(api+'/users/:_id')

    .get(function (req, res) {
      var id = req.params._id;
      var _ids;

      if (id && id.length > 1){
        id = id.split(',');
        for(var i=0; i<id.length;i++) { id[i] = +id[i]; }
        _ids = id;
      } else {
        _ids = Number(id);
      }

      User.find({_id: { $in: _ids}}, function (err, users) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(users);
      });
    })

    .put(function (req, res){
      var id = req.params._id;
      var jsonData = JSON.parse(req.body.jsonData);

      var profiles = ((!empty(jsonData.profiles) && jsonData.profiles.length > 0) ? jsonData.profiles : [] ),
          groups = ((!empty(jsonData.groups) && jsonData.groups.length > 0) ? jsonData.groups : []);
      var conditions = { _id: id },
          update = { profiles: profiles, groups: groups },
          options = { multi: false };

      User.update(conditions, update, options, callback);

      function callback (err, numAffected) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        // console.log('numAffected',numAffected);
        res.json({ message: numAffected.n+' User updated.' });
      }

  /*    User.findById (id, function (err, user){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        if (jsonData.profiles && jsonData.profiles.length > 0) user.profiles = jsonData.profiles;
        else user.profiles = [];

        if (jsonData.groups && jsonData.groups.length > 0) user.groups = jsonData.groups;
        else user.groups = [];

        user.save(function (err, numAffected, n){
          if (err) {
            res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
          }

          res.json({ message: n+' User updated.' });
        });
      });
  */
    })

    .delete(function (req, res){
      var id = req.params._id;
      var _ids;

      if (id && id.length > 1){
        id = id.split(',');
        for(var i=0; i<id.length;i++) { id[i] = +id[i]; }
        _ids = id;
      } else {
        _ids = Number(id);
      }

      User.remove({_id: { $in: _ids}}, function (err, user){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json({ message: user.length + ' User(s) deleted.' });
      });
    });

  router.route(api+'/users/groups/:groups')

    .get(function (req, res) {
      var groupId = req.params.groups;
      var g_ids;

      if (groupId && groupId.length > 1){
        groupId = groupId.split(',');
        for(var i=0; i<groupId.length;i++) { groupId[i] = +groupId[i]; }
        g_ids = groupId;
      } else {
        g_ids = Number(groupId);
      }

      User.find({groups: g_ids}, function (err, users) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(users);
      });
    });


  /* GROUPS */

  router.route(api+'/groups')

    .get(function (req, res) {

      Group.find(function (err, groups) {
        console.log(groups);
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(groups);
      });
    })

    .post(function (req, res){
      var jsonData = JSON.parse(req.body.jsonData);
      var group = new Group();

      //group._id = (new mongoose.Types.ObjectId).toString();
      group.label = jsonData.label;
      group.description = jsonData.description;
      group.level = jsonData.level;
      group.parentid = jsonData.parentid;
      group.relationships = jsonData.relationships;
      //group.profile_fields = jsonData.profile_fields;

      group.save(function (err){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json({ message: '1 Group created.', newId: group._id });
      });
    });

  router.route(api+'/groups/:_id')

    .get(function (req, res) {
      var id = req.params._id;
      var _ids;

      if (id && id.length > 1){
        id = id.split(',');
        for(var i=0; i<id.length;i++) { id[i] = +id[i]; }
        _ids = id;
      } else {
        _ids = Number(id);
      }

      Group.find({_id: { $in: _ids}}, function (err, groups) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        //var sortedFields = groups[0].profile_fields.sort(fieldsOrder);

        res.json(groups);
      });

      function fieldsOrder(f1, f2) {
        return f1.order - f2.order;
      }
    })

    .put(function (req, res){
      var id = req.params._id;
      var jsonData = JSON.parse(req.body.jsonData);

      /*var label = ((!empty(jsonData.label) && jsonData.label.length > 0) && jsonData.label ),
          description = ((!empty(jsonData.description) && jsonData.description.length > 0) && jsonData.description ),
          level = (!empty(jsonData.level) && jsonData.level ),
          parentid = (!empty(jsonData.parentid) && jsonData.parentid ),
          relationships = ((!empty(jsonData.relationships) && jsonData.relationships.length > 0) ? jsonData.relationships : []),
          profile_fields = ((!empty(jsonData.profile_fields) && jsonData.profile_fields.length > 0) ? jsonData.profile_fields : []);
      var conditions = { _id: id },
          update =  {
                      label: label,
                      description: description,
                      level: level,
                      parentid: parentid,
                      relationships: relationships,
                      profile_fields: profile_fields
                    },
          options = { multi: false };

      Group.update(conditions, update, options, callback);

      function callback (err, numAffected) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json({ message: numAffected.n+' Group updated.' });
      }*/

      Group.findById(id, function (err, group){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        if (!empty(jsonData.label) && jsonData.label.length > 0) group.label = jsonData.label;
        if (!empty(jsonData.description) && jsonData.description.length > 0) group.description = jsonData.description;
        if (!empty(jsonData.level)) group.level = jsonData.level;
        if (!empty(jsonData.parentid)) group.parentid = jsonData.parentid;
        if (!empty(jsonData.relationships) && jsonData.relationships.length > 0) group.relationships = jsonData.relationships;
        if (!empty(jsonData.profile_fields) && jsonData.profile_fields.length > 0) group.profile_fields = jsonData.profile_fields;

        group.save(function (err){
          if (err) {
            res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
          }

          res.json({ message: '1 Group updated.' });
        });
      });
    })

    .delete(function (req, res){
      var id = req.params._id;
      var _ids;

      if (id && id.length > 1){
        id = id.split(',');
        for(var i=0; i<id.length;i++) { id[i] = +id[i]; }
        _ids = id;
      } else {
        _ids = Number(id);
      }
      // console.log(_ids);

      Group.remove({_id: { $in: _ids}}, function (err, group){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json({ message: group.length +' Group(s) deleted.' });
      });
    });

  router.route(api+'/groups/level/:level')

    .get(function (req, res) {
      var levelId = req.params.level;

      Group.find({level: levelId}, function (err, groups) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(groups);
      });
    });

  router.route(api+'/groups/parentid/:pid')

    .get(function (req, res) {
      var pid = req.params.pid;

      Group.find({parentid: pid}, function (err, groups) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(groups);
      });
    });


  /* ROLES */

  router.route(api+'/roles')

    .get(function (req, res) {

      Role.find(function (err, roles) {
        console.log(roles);
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(roles);
      });
    })

    .post(function (req, res){
      var jsonData = JSON.parse(req.body.jsonData);
      var role = new Role();

      //role._id = new mongoose.Types.ObjectId;
      role.rolelabel = jsonData.rolelabel;
      role.rolekey = jsonData.rolekey;
      role.is_default = jsonData.is_default;

      role.save(function (err){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json({ message: '1 Role created.', newId: role._id });
      });
    });

  router.route(api+'/roles/:_id')

    .get(function (req, res) {
      var id = req.params._id;
      var _ids;

      if (id.indexOf(",") > 0){
        id = id.split(',');
        for(var i=0; i<id.length;i++) { id[i] = +id[i]; }
        _ids = id;
      } else {
        _ids = Number(id);
      }

      Role.find({_id: { $in: _ids}}, function (err, roles) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(roles);
      });
    })

    .put(function (req, res){
      var id = req.params._id;
      var jsonData = JSON.parse(req.body.jsonData);

      var rolelabel = ((!empty(jsonData.rolelabel) && jsonData.rolelabel.length > 0) && jsonData.rolelabel ),
          rolekey = ((!empty(jsonData.rolekey) && jsonData.rolekey.length > 0) && jsonData.rolekey ),
          is_default = (typeof jsonData.is_default !== 'undefined') && jsonData.is_default;
      var conditions = { _id: id },
          update =  {
                      rolelabel: rolelabel,
                      rolekey: rolekey,
                      is_default: is_default
                    },
          options = { multi: false };

      Role.update(conditions, update, options, callback);

      function callback (err, numAffected) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        // console.log('numAffected',numAffected);
        res.json({ message: numAffected.n+' Role updated.' });
      }

  /*    Role.findById(id, function (err, role){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        if (jsonData.rolelabel && jsonData.rolelabel.length > 0) role.rolelabel = jsonData.rolelabel;
        if (jsonData.rolekey && jsonData.rolekey.length > 0) role.rolekey = jsonData.rolekey;
        if (jsonData.is_default.length > 0) role.is_default = jsonData.is_default;

        role.save(function (err){
          if (err) {
            res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
          }

          res.json({ message: '1 Role updated.' });
        });
      });*/
    })

    .delete(function (req, res){
      var id = req.params._id;
      var _ids;

      if (id.indexOf(",") > 0){
        id = id.split(',');
        for(var i=0; i<id.length;i++) { id[i] = +id[i]; }
        _ids = id;
      } else {
        _ids = Number(id);
      }

      Role.remove({_id: { $in: _ids}}, function (err, role){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json({ message: role.length +' Role(s) deleted.' });
      });
    });

  router.route(api+'/roles/key/:key')

    .get(function (req, res) {
      var keyId = req.params.key;

      Role.find({rolekey: keyId}, function (err, roles) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(roles);
      });
    });


  /* PROFILE FIELDS */

  router.route(api+'/profilefields')

    .get(function (req, res) {

      ProfileField.find(function (err, profileFields) {
        console.log(profileFields);
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(profileFields);
      });
    })

    .post(function (req, res){
      var jsonData = JSON.parse(req.body.jsonData);
      var profileField = new ProfileField();

      //profileField._id = new mongoose.Types.ObjectId.toString();
      profileField.type = jsonData.type;
      profileField.label = jsonData.label;
      profileField.model = jsonData.model;
      profileField.is_required = jsonData.is_required;
      profileField.is_default = jsonData.is_default;

      profileField.save(function (err){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json({ message: '1 Profile field created.', newId: profileField._id });
      });
    });

  router.route(api+'/profilefields/:_id')

    .get(function (req, res) {
      var id = req.params._id;
      var _ids;

      if (id && id.length > 1){
        id = id.split(',');
        for(var i=0; i<id.length;i++) { id[i] = +id[i]; }
        _ids = id;
      } else {
        _ids = Number(id);
      }

      ProfileField.find({_id: { $in: _ids}}, function (err, profilefields) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(profilefields);
      });
    })

    .put(function (req, res){
      var id = req.params._id;
      var jsonData = JSON.parse(req.body.jsonData);

      var type = ((!empty(jsonData.type) && jsonData.type.length > 0) && jsonData.type ),
          label = ((!empty(jsonData.label) && jsonData.label.length > 0) && jsonData.label ),
          model = ((!empty(jsonData.model) && jsonData.model.length > 0) && jsonData.model ),
          is_required = (typeof jsonData.is_required !== 'undefined') && jsonData.is_required,
          is_default = (typeof jsonData.is_default !== 'undefined') && jsonData.is_default;
      var conditions = { _id: id },
          update =  {
                      type: type,
                      label: label,
                      model: model,
                      is_required: is_required,
                      is_default: is_default
                    },
          options = { multi: false };

      ProfileField.update(conditions, update, options, callback);

      function callback (err, numAffected) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        // console.log('numAffected',numAffected);
        res.json({ message: numAffected.n+' Profile field updated.' });
      }

  /*    ProfileField.findById(id, function (err, profilefield){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        if (jsonData.type && jsonData.type.length > 0) profileField.type = jsonData.type;
        if (jsonData.label && jsonData.label.length > 0) profileField.label = jsonData.label;
        if (jsonData.model && jsonData.model.length > 0) profileField.model = jsonData.model;
        if (jsonData.is_required.length > 0) profileField.is_required = jsonData.is_required;
        if (jsonData.is_default.length > 0) profileField.is_default = jsonData.is_default;

        profileField.save(function (err){
          if (err) {
            res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
          }

          res.json({ message: '1 Profile field updated.' });
        });
      });*/
    })

    .delete(function (req, res){
      var id = req.params._id;

      ProfileField.remove({ _id: id}, function (err, profileField){
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json({ message: profileField.length +' Profile field(s) deleted.' });
      });
    });

  router.route(api+'/profilefields/model/:model')

    .get(function (req, res) {
      var modelId = req.params.key;

      ProfileField.find({model: modelId}, function (err, profilefields) {
        if (err) {
          res.status(HTTPStatus(500)).send('Internal Server Error: '+ err);
        }

        res.json(profilefields);
      });
    });


  function empty(v) {
      var type = typeof v;
      if(type === 'undefined')
          return true;
      if(type === 'boolean')
          return true;
      if(v === null)
          return true;
      if(v == undefined)
          return true;
      if(type === 'array' || type === 'string')
          if(v.length < 1)
              return true;
      else if(type === 'object')
          if(Object.keys(v).length < 1)
              return true;
      return false;
  }

//};
module.exports = router;
