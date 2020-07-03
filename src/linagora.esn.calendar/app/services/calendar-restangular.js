
(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calendarRestangular', calendarRestangular);

  function calendarRestangular(Restangular, httpConfigurer) {
    var restangularInstance = Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setFullResponse(true);
    });

    httpConfigurer.manageRestangular(restangularInstance, '/calendar/api');

    return restangularInstance;
  }

})();
