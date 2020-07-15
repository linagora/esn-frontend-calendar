(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calSettingsDisplaySubheader', {
      bindings: {
        submit: '&',
        form: '<'
      },
      template: require("./settings-display-subheader.pug")
    });
})(angular);
