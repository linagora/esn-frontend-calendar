(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalendarsListItemController', CalendarsListItemController);

  function CalendarsListItemController($log, ESN_RESOURCE, calResourceService, calendarService) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      initDetails();

      self.calendar.isResource() && initResourceIcon();
    }

    function initDetails() {
      if (!self.showDetails) {
        return;
      }

      if (self.calendar.isResource()) {
        return calendarService.getResourceDescription(self.calendar).then(function(resourceDescription) {
          self.details = resourceDescription;
        });
      }

      return calendarService.getOwnerDisplayName(self.calendar).then(function(ownerDisplayName) {
        self.details = ownerDisplayName;
      });
    }

    function initResourceIcon() {
      self.resourceIcon = ESN_RESOURCE.DEFAULT_ICON;

      return calResourceService.getResourceIcon(self.calendar.source.calendarHomeId)
        .then(function(resourceIcon) {
          self.resourceIcon = resourceIcon;
        })
        .catch(function(err) {
          $log.error(err);
        });
    }
  }
})(angular);
