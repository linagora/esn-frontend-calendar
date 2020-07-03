(function() {
  'use strict';

  angular.module('linagora.esn.resource')
    .controller('ESNResourceFormCreateController', ESNResourceFormCreateController);

  function ESNResourceFormCreateController($state, type, _, esnResourceAPIClient, asyncAction, session, ESN_RESOURCE) {
    var self = this;

    self.type = type;
    self.beAdmin = true;
    self.submit = submit;
    self.resourceAdministrators = [];
    self.resourceTypes = ESN_RESOURCE.TYPES;
    self.defaultResourceType = 'resource';
    self.selectedType = self.type || 'resource';
    self.isSelected = isSelected;

    function isSelected(type) {
      return type === self.selectedType;
    }

    function submit() {
      return asyncAction({
        progressing: 'Creating resource...',
        success: 'Resource has been created',
        failure: 'Failed to create resource'
      }, function() {
        self.resource.type = self.selectedType;
        self.resource.icon = self.resource.icon ? self.resource.icon : ESN_RESOURCE.DEFAULT_ICON;
        self.resource.administrators = _.map(self.resourceAdministrators, function(admin) {
          return {
            id: admin._id,
            objectType: 'user'
          };
        });

        if (self.beAdmin) {
          self.resource.administrators.push({
            id: session.user._id,
            objectType: 'user'
          });
        }

        return esnResourceAPIClient.create(self.resource).finally(function() {
          $state.reload();
        });
      });
    }
  }
})();
