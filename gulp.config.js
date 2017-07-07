module.exports = function() {
  var root = './';
  var client = './client/';
  var clientApp = client + 'app/';
  var report = './report/';
  var models = './models/';
  var temp = './.tmp/';
  var wiredep = require('wiredep');
  var bowerFiles = wiredep({devDependencies: true})['js'];
  var bower = {
      json: require('./bower.json'),
      directory: clientApp + 'bower_components/',
      ignorePath: '../..'
  };
  var nodeModules = 'node_modules';

  var config = {
      alljs: [
        clientApp + '**/*.js',
        models + '*.js',
        './*.js'
      ],
      build: './build/',
      css: '/styles.css',
      //clientApp + 'styles/styles.css'
      tmpcss: temp + 'styles',
      fonts: [
        bower.directory + 'font-awesome/fonts/**/*.*',
        bower.directory + 'materialize/font/material-design-icons/**/*.*',
        bower.directory + 'materialize/font/roboto/**/*.*'
      ],
      html: './*.html',
      htmltemplates: [
        clientApp + '**/*.html',
        "!" + bower.directory + '**/*.html',
        "!" + clientApp + 'admin/**/*.html',
        "!" + clientApp + 'widgets/**/*.html'
      ],
      index: client + '_index.html',
      // app js, with no bower components and specs
      js: [
          clientApp + '/**/*.module.js',
          clientApp + '/**/*.js',
          "!" + 'node_modules/**/*.js',
          "!" + bower.directory + '**/*.js',
          '!' + clientApp + '**/*.spec.js',
          "!" + clientApp + 'admin/**/*.js',
          "!" + clientApp + 'widgets/**/*.js'
      ],
      jsOrder: [
        '**/app.module.js',
        'core/**/*.module.js',
        'core/**/*.js',
        'blocks/**/*.module.js',
        'blocks/**/*.js',
        'layout/**/*.module.js',
        'layout/**/*.js',
        'dashboard/**/*.module.js',
        'dashboard/**/*.js',
        'mycommunity/**/*.module.js',
        'mycommunity/**/*.js',
        'myservices/**/*.module.js',
        'myservices/**/*.js',
        'services-store/**/*.module.js',
        'services-store/**/*.js'
      ],
      report: report,
      root: root,
      temp: temp,

      /**
       * optimized files
       */
      optimized: {
          app: 'app.js',
          lib: 'lib.js'
      },

      /**
       * plato
       */
      plato: {js: clientApp + '**/*.js'},

      /**
       * template cache
       */
      templateCache: {
          file: 'templates.js',
          options: {
              module: 'app.core',
              root: 'app/',
              standAlone: false
          }
      },

      /**
       * Bower and NPM files
       */
      bower: bower,
      packages: [
          './package.json',
          './bower.json'
      ],

      /**
       * Node settings
       */
      nodeServer: './server.js',
      defaultPort: '8080'
  };

  /**
   * wiredep and bower settings
   */
  config.getWiredepDefaultOptions = function() {
      var options = {
          bowerJson: config.bower.json,
          directory: config.bower.directory,
          ignorePath: config.bower.ignorePath
      };
      return options;
  };

  return config;

};
