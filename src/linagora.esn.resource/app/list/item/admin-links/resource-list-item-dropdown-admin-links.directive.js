(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .directive('esnResourceListItemDropdownAdminLinks', function() {
      return {
        restrict: 'E',
        template: require('./resource-list-item-dropdown-admin-links.pug')
      };
    });
})(angular);
