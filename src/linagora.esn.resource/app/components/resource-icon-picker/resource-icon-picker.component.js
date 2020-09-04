(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .component('esnResourceIconPicker', {
      template: require('./resource-icon-picker.pug'),
      bindings: {
        icon: '=?'
      },
      controller: 'esnResourceIconPickerController',
      controllerAs: 'ctrl'
    });
})(angular);
