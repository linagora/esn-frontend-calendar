(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('UserCalendarsListController', UserCalendarsListController);

  function UserCalendarsListController($state, $rootScope) {
    var self = this;

    self.$onInit = $onInit;

    ///////////////

    function $onInit() {
      self.calendarType = 'userCalendars';
      $rootScope.$on('calendarsAreHidden', verifyIfCalendarsIsHidden);

    }

    function verifyIfCalendarsIsHidden(event, data) {
      self.calendarsToggled = data.hidden;
    }
  }
})(angular);
