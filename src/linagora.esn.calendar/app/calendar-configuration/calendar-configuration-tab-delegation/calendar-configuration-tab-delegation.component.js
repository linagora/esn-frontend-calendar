(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calendarConfigurationTabDelegation', calendarConfigurationTabDelegation());

  ////////////

  function calendarConfigurationTabDelegation() {
    return {
      template: require("./calendar-configuration-tab-delegation.pug"),
      bindings: {
        delegations: '=',
        selectedShareeRight: '=',
        newUsersGroups: '=',
        addUserGroup: '=',
        removeUserGroup: '=',
        calendarOwner: '='
      },
      controller: 'CalendarConfigurationTabDelegationController'
    };
  }
})();
