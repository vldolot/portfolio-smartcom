(function() {
    'use strict';

    angular
        .module('app.community')
        .directive('multiSelect', multiSelect);

    multiSelect.$inject = ['$q'];

    /* @ngInject */
    function multiSelect($q) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            require: 'ngModel',
            restrict: 'E',
            scope: {
				      selectedLabel: "@",
				      availableLabel: "@",
				      displayAttr: "@",
				      available: "=",
				      model: "=ngModel",
				      config: "="
			    	},
			    	template: '<div class="multiSelect" layout="row">' + 
        '<div class="select" flex>' + 
          '<label class="control-label" for="multiSelectSelected">{{ selectedLabel }} ' +
              '({{ model.length }})</label>' +
          '<select id="currentRoles" ng-model="selected.current" multiple ' + 
              'class="pull-left" ng-options="e as e[displayAttr] for e in model">' + 
              '</select>' + 
        '</div>' + 
        '<div class="select buttons" flex="1">' + 
        	'<md-button class="md-fab md-mini btn mover left" ng-click="add()" title="Add selected" ng-disabled="selected.available.length == 0">' +
            '<i class="material-icons md-24">arrow_back</i>' +
            '<md-tooltip md-direction="top">Add selected</md-tooltip>' +
          '</md-button>' +
        	'<md-button class="md-fab md-mini btn mover right" ng-click="remove()" title="Remove selected" ng-disabled="selected.current.length == 0">' +
            '<i class="material-icons md-24">arrow_forward</i>' +
            '<md-tooltip md-direction="top">Remove selected</md-tooltip>' +
          '</md-button>' +
        '</div>' + 
        '<div class="select" flex>' +
          '<label class="control-label" for="multiSelectAvailable">{{ availableLabel }} ' +
              '({{ available.length }})</label>' +
          '<select id="multiSelectAvailable" ng-model="selected.available" multiple ' +
              'ng-options="e as e[displayAttr] for e in available"></select>' +
        '</div>' +
	      '<input type="number" name="numSelected" ng-model="numSelected" ' +
            'style="display: none">' +
      '</div>'
        };
        return directive;

        function link(scope, elm, attrs) {
			      scope.selected = {
			        available: [],
			        current: []
			      };

			      /* Handles cases where scope data hasn't been initialized yet */
			      var dataLoading = function(scopeAttr) {
			        var loading = $q.defer();
			        if(scope[scopeAttr]) {
			          loading.resolve(scope[scopeAttr]);
			        } else {
			          scope.$watch(scopeAttr, function(newValue, oldValue) {
			            if(newValue !== undefined)
			              loading.resolve(newValue);
			          });  
			        }
			        return loading.promise;
			      };

			      /* Filters out items in original that are also in toFilter. Compares by reference. */
			      var filterOut = function(original, toFilter) {
			        var filtered = [];
			        angular.forEach(original, function(entity) {
			          var match = false;
			          for(var i = 0; i < toFilter.length; i++) {
			            if(toFilter[i][attrs.displayAttr] == entity[attrs.displayAttr]) {
			              match = true;
			              break;
			            }
			          }
			          if(!match) {
			            filtered.push(entity);
			          }
			        });
			        return filtered;
			      };

			      var requiredMin, inputModel;
			      function ensureMinSelected() {
		          if(requiredMin && scope.model) {
		            scope.numSelected = scope.model.length;
		            inputModel.$setValidity('min', (scope.numSelected >= requiredMin));
		          }
		        }

			      scope.refreshAvailable = function() {
			      	if(scope.model && scope.available){
				        scope.available = filterOut(scope.available, scope.model);
				        scope.selected.available = [];
				        scope.selected.current = [];
				      }
			      }; 

			      scope.add = function() {
			        scope.model = scope.model.concat(scope.selected.available);
			        scope.refreshAvailable();
			      };
			      scope.remove = function() {
			        scope.available = scope.available.concat(scope.selected.current);
			        scope.model = filterOut(scope.model, scope.selected.current);
			        scope.refreshAvailable();
			      };

			      $q.all([dataLoading("model"), dataLoading("available")]).then(function(results) {
			        scope.refreshAvailable();
			      });

		        //Watching the model, updating if the model is a resolved promise
		        scope.watchModel = function(){
		          if(scope.model && scope.model.hasOwnProperty('$promise') && !scope.model.$resolved){
		            scope.model.then(function(results) {
		              scope.$watch('model', scope.watchModel);
		            });
		          }
		          else{
		            scope.refreshAvailable();
		            scope.$watch('model', scope.refreshAvailable);  
		          }
		        };
		        
		        //Watching the list of available items. Updating if it is a resolved promise, and refreshing the 
		        //available list if the list has changed
		        var _oldAvailable = {};
		        scope.watchAvailable = function(){
		          if(scope.available && scope.available.hasOwnProperty('$promise') && !scope.available.$resolved){
		            scope.available.$promise.then(function(results) {
		              scope.$watch('available', scope.watchAvailable);
		            });
		          }
		          else{
		            //We only want to refresh the list if the list of available items has changed
		            //and the variable is defined
		            if(scope.available && scope.available != _oldAvailable){
		              scope.refreshAvailable();
		              _oldAvailable = scope.available; 
		            }
		          }
		        };

		        scope.$watch("available", scope.watchAvailable);
		        scope.$watch("model", scope.watchModel);

						if(scope.config && angular.isDefined(scope.config.requiredMin)) {
		          var inputs = elm.find("input");
		          var validationInput = angular.element(inputs[inputs.length - 1]);
		          inputModel = validationInput.controller('ngModel');
		        }

						scope.$watch('config.requiredMin', function(value) {
		          if(angular.isDefined(value)) {
		            requiredMin = parseInt(value, 10);
			          // console.log("requiredMin: "+requiredMin);
		            ensureMinSelected();
		          }
		        });

		        scope.$watch('model.length', function(selected) {
		          ensureMinSelected();
		        });

        }
    }
    
})();