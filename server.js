// express.js declarations
var application_root = __dirname,
    express = require("express"),
	path = require("path"),
    bodyParser = require('body-parser'),
    autoIncrement = require('mongoose-auto-increment');
var app = express();

// DB Config
var mongodburl = 'mongodb://localhost:27017/smartcommunities'; // "username:password@example.com/mydb"
var mongoose = require('mongoose');
mongoose.connect(mongodburl);
var db = mongoose.connection;

autoIncrement.initialize(mongoose.connection);

// DB Events
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('database connected')
});

var logger = require('morgan');
var HTTPStatus = require('statuses');
var compress = require('compression')
var cors = require('cors');
var port = process.env.PORT || 8080;
var environment = process.env.NODE_ENV;
//var engines  = require('consolidate');
// var router = express.Router();
// var api = '';

// var userdao = require('./dao/userdao.js');
// var groupdao = require('./dao/groupdao.js');
// var roledao = require('./dao/roledao.js');
// var profiledao = require('./dao/profiledao.js');

console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);

// Config
app.use(logger('dev'));
app.use(compress());
app.use(cors());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

switch (environment) {
    case 'build':
        console.log('** BUILD **');
        app.use(express.static(path.join(__dirname, 'build')));
        app.use('/app/api/*', express.static('./client/app/api/sideNavData.json'));
        // Any invalid calls for templateUrls are under app/* and should return 404
        // app.use('/app/*', function(req, res, next) {
        //   send404(req, res);
        //   next();
        // });
        app.use(express.static('./client/app/bower_components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js'));
        app.use('/font/*', express.static('./build/fonts/'));
        // Any deep link calls should return index.html
        //app.use('/*', express.static('./build/index.html'));
        break;
    default:
        console.log('** DEV **');
        app.use(express.static(path.join(__dirname, 'client')));
        // app.use(express.static('./'));
        app.use(express.static(path.join(__dirname, '.tmp')));
        // All the assets are served at this point.
        // Any invalid calls for templateUrls are under app/* and should return 404
        //app.use('/app/api/*', express.static('./client/app/api/sideNavData.json'));
        app.use('/app/*', function(req, res, next) {
          send404(req, res);
          next();
        });
        // Any deep link calls should return index.html
        // app.use('/*', express.static('./client/index.html'));
        break;
}

//app.use(express.static(path.join(__dirname, 'client')));

//app.use('/*', express.static('./client/index.html'));

var routes = require('./routes');
app.use('/api', routes);

function send404(req, res, description) {
    var data = {
        status: 404,
        message: 'Not Found',
        description: description,
        url: req.url
    };
    res.status(404)
        .send(data)
        .end();
}

app.listen(port);
