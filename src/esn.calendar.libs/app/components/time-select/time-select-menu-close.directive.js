'use strict';

angular.module('esn.calendar.libs')
  .directive('timeSelectMenuClose', timeSelectMenuClose);

// The purpose of this directive is to fix clicking outside a mdMenu not actually closing it.
function timeSelectMenuClose() {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      const clickHandler = function(event) {
        const clickledOnChild = $(element).has(event.target).length > 0;
        const clickedOnSelf = element[0] === event.target;
        const clickedInsideMenu = clickedOnSelf || clickledOnChild;

        if (!clickedInsideMenu) {
          $scope.$apply(attrs.timeSelectMenuClose);
        }
      };

      $scope.$watch('$mdMenuOpen', function() {
        document.addEventListener('click', clickHandler);
      });
    }
  };
}
