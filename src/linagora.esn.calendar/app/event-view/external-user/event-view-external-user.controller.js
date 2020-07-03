(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalEventViewExternalUserController', CalEventViewExternalUserController);

  function CalEventViewExternalUserController($http, notificationFactory, esnI18nService, _) {
    var self = this;

    self.$onInit = $onInit;
    self.changeParticipation = changeParticipation;
    self.isExternal = true;
    function $onInit() {
      self.userAsAttendee = Object.create(self.externalAttendee);
      self.selectedTab = 'attendees';
      self.linksMapping = {
        ACCEPTED: self.links.yes,
        TENTATIVE: self.links.maybe,
        DECLINED: self.links.no
      };
      self.organizerAttendee = _.find(self.attendees.users, { email: self.event.organizer.email });
      self.usersAttendeesList = _.reject(self.attendees.users, { email: self.event.organizer.email });
    }

    function changeParticipation(partstat) {
      self.userAsAttendee.partstat = partstat;
      self.usersAttendeesList = self.usersAttendeesList.map(function(user) {
        if (user.email === self.externalAttendee.email) {
          user.partstat = partstat;
        }

        return user;
      });

      $http({ method: 'GET', url: self.linksMapping[partstat] }).then(function() {
        var participation = partstat.charAt(0).toUpperCase() + partstat.slice(1).toLowerCase();

        notificationFactory.weakInfo('Participation', esnI18nService.translate('Participation updated: %s', participation));
      });
    }
  }
})();
