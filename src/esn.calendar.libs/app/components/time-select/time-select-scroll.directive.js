'use strict';

angular.module('esn.calendar.libs')
  .directive('timeSelectScroll', timeSelectScroll);

function timeSelectScroll($timeout) {
  return {
    restrict: 'A',
    link: function($scope, element) {

      $scope.$on('$mdMenuOpen', function() {
        const target = element[0].querySelector('.active-item');

        $timeout(function() {
          target.scrollIntoView();
        }, 500);
      });
    }
  };
}
