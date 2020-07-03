(function(angular) {
  'use strict';

  angular.module('esn.calendar').component('eventSearchForm', {
    template: require("./search-form.pug"),
    controller: 'EventSearchFormController',
    bindings: {
      query: '='
    }
  });
})(angular);
