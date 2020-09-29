'use strict';

angular.module('esn.calendar.libs')
  .directive('timeSelectMenuClose', timeSelectMenuClose);

// The purpose of this directive is to fix clicking outside a mdMenu not actually closing it.
function timeSelectMenuClose() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      const clickHandler = function(event) {
        const clickedOnRefs = Array.isArray(scope.additionalClickRefs) && scope.additionalClickRefs.some(ref => event.target === ref);
        const clickedOnChild = $(element).has(event.target).length > 0;
        const clickedOnSelf = element[0] === event.target;

        if (!clickedOnSelf && !clickedOnChild && !clickedOnRefs) {
          scope.$apply(attrs.timeSelectMenuClose);
        }
      };

      scope.$on('$mdMenuOpen', function() {
        document.addEventListener('click', clickHandler);
      });

      scope.$on('$mdMenuClose', function() {
        document.removeEventListener('click', clickHandler);
      });
    }
  };
}
