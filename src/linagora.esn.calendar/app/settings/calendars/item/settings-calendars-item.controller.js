(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalSettingsCalendarsItemController', CalSettingsCalendarsItemController);

  function CalSettingsCalendarsItemController($state, session, userUtils, calUIAuthorizationService) {
    var self = this;

    self.canDeleteCalendar = canDeleteCalendar;
    self.goTo = goTo;
    self.remove = remove;
    self.$onInit = $onInit;

    function $onInit() {
      if (self.displayOwner) {
        getOwnerDisplayName().then(function(ownerDisplayName) {
          self.ownerDisplayName = ownerDisplayName;
        });
      }
    }

    function canDeleteCalendar() {
      return calUIAuthorizationService.canDeleteCalendar(self.calendar, session.user._id);
    }

    function getOwnerDisplayName() {
      return self.calendar.getOwner().then(userUtils.displayNameOf);
    }

    function goTo() {
      $state.go(self.stateToGo, { calendarUniqueId: self.calendar.uniqueId, previousState: 'calendar.settings.calendars'});
    }

    function remove() {
      self.onRemove(self.calendar);
    }
  }
})();
