(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calSidebarTitle', {
      template: require('./sidebar-title.pug')
    });
})(angular);
