(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalSettingsIndexController', CalSettingsIndexController);

  function CalSettingsIndexController($scope, touchscreenDetectorService) {
    $scope.hasTouchscreen = touchscreenDetectorService.hasTouchscreen();
  }
})(angular);
