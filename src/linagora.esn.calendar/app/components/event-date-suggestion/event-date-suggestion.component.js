(function(angular) {
'use strict';

angular.module('esn.calendar')
  .component('calEventDateSuggestion', {
    template: require("./event-date-suggestion.pug"),
    controller: 'calEventDateSuggestionController',
    controllerAs: 'ctrl',
    bindings: {
      event: '<',
      use24hourFormat: '<'
    }
  });
})(angular);
