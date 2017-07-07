/** Application Modules */
(function() {
    'use strict';
    
    angular
      .module('app', [
	        'app.core',
	        'app.layout',
	        'app.dashboard',
	        'app.community',
	        'app.services',
	        'app.servicesStore'
      ]);
})();