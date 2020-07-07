require('../app/core/application-menu-calendar.directive.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .config(configBlock);

    function configBlock(dynamicDirectiveServiceProvider) {
      var dd = new dynamicDirectiveServiceProvider.DynamicDirective(true, 'application-menu-calendar', {priority: 40});

      dynamicDirectiveServiceProvider.addInjection('esn-application-menu', dd);
    }

})(angular);
