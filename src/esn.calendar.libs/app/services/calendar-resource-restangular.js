(function(angular) {
  'use strict';

  angular.module('esn.calendar.libs')
    .factory('calendarResourceRestangular', calendarResourceRestangular);

  function calendarResourceRestangular(Restangular, httpConfigurer) {
    var restangularInstance = Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setFullResponse(true);
    });

    httpConfigurer.manageRestangular(restangularInstance, '/calendar/api/resources');

    return restangularInstance;
  }

})(angular);
