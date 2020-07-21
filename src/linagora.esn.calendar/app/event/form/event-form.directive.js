require('./event-form.controller.js');
require('../../core/auto-size-and-update.directive.js');
require('../../components/attendee-tabs/attendee-tabs.component.js');
require('../../components/attendee/list/attendee-list.component.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .directive('calEventForm', calEventForm);

  function calEventForm() {
    var directive = {
      restrict: 'E',
      template: require("./event-form.pug"),
      link: link,
      replace: true,
      controller: 'CalEventFormController'
    };

    return directive;

    ////////////

    function link(scope) {
      scope.$on('$locationChangeStart', hideModal);

      function hideModal(event) {
        if (scope.$isShown) {
          event.preventDefault();
          scope.$hide();
        }
      }
    }
  }

})(angular);
