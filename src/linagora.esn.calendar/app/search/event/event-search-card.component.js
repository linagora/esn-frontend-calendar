(function(angular) {
  'use strict';

  angular.module('esn.calendar')
     .component('calEventSearchCard', {
       template: require("./event-search-card.pug"),
       bindings: {
         event: '<',
         start: '<',
         end: '<'
       }
    });
})(angular);
