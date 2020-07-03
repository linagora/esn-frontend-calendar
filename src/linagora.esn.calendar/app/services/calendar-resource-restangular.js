
(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calendarResourceRestangular', calendarResourceRestangular);

  function calendarResourceRestangular(Restangular, httpConfigurer) {
    var restangularInstance = Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setFullResponse(true);
    });

    httpConfigurer.manageRestangular(restangularInstance, '/calendar/api/resources');

    return restangularInstance;
  }

})();
