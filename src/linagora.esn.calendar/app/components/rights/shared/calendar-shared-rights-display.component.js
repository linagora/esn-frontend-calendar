(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calSharedRightsDisplay', {
      bindings: {
        public: '<',
        delegation: '<'
      },
      controller: 'CalSharedRightsDisplayController',
      template: '<span>{{::$ctrl.humanReadable | esnI18n}}</span>'
    });
})();
