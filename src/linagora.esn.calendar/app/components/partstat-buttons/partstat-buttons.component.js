(function(angular) {
  'use strict';

  angular.module('esn.calendar').component('calPartstatButtons', {
    template: require("./partstat-buttons.pug"),
    bindings: {
      event: '=',
      changePartstat: '&?',
      onParticipationChangeSuccess: '&',
      onParticipationChangeError: '&',
      showDateSuggestion: '&'
    },
    controller: 'CalPartstatButtonsController',
    controllerAs: 'ctrl'
  });
})(angular);
