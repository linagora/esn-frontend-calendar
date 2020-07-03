(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalendarConfigurationTabDelegationController', CalendarConfigurationTabDelegationController);

  function CalendarConfigurationTabDelegationController(
    CAL_CALENDAR_SHARED_RIGHT
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.onAddingUser = onAddingUser;

    ///////////

    function $onInit() {
      self.delegations = self.delegations || [];

      self.delegationTypes = [
        {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN,
          name: CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN_LABEL_LONG
        }, {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE,
          name: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE_LABEL_LONG
        }, {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ,
          name: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_LABEL_LONG
        }];

      self.ignoredUsers = [self.calendarOwner];
    }

    function onAddingUser($tags) {
      var canBeAdded = !!$tags._id && !self.delegations.some(function(delegation) {
          return $tags._id === delegation.user._id;
        });

      return canBeAdded;
    }
  }
})();
