require('../../constants.js');
require('../../components/mini-calendar/mini-calendar.service.js');
require('./mini-calendar.controller');
require('../calendar/calendar.component.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .directive('miniCalendarMobile', miniCalendarMobile);

  function miniCalendarMobile($window, miniCalendarService, CAL_EVENTS) {
    var directive = {
      restrict: 'E',
      template: require("./mini-calendar.pug"),
      scope: {
        calendarHomeId: '='
      },
      link: link,
      replace: true,
      controller: 'miniCalendarController'
    };

    return directive;

    ////////////

    function link(scope, element) { // eslint-disable-line
      scope.$on(CAL_EVENTS.MINI_CALENDAR.TOGGLE, function() {
        // initial-state is invisible and height: 0 so that the mini-calendar is not
        // expanded yet
        element.removeClass('initial-state');
        // This is used for slideToggle with jQuery.
        element.addClass('display-none');
        element.stop(true, false).slideToggle(200, function() {
          angular.element($window).trigger('resize');
        });
      });
    }
  }

})(angular);
