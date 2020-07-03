(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calManageLeftMenu', {
      controllerAs: 'ctrl',
      template: require("./manage-left-menu.pug")
    });
})();
