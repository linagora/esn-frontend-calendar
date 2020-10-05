'use strict';

angular.module('esn.calendar.libs')
  .directive('timeSelectScroll', timeSelectScroll);

function timeSelectScroll() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      const callback = function(mutations) {
        mutations.forEach(mutation => {
          const firstAddedNode = mutation.addedNodes[0];

          if (!firstAddedNode || !firstAddedNode.className.includes('md-open-menu-container') ||
              !firstAddedNode.contains(element[0])
          ) return;

          const target = element.find('.active-item')[0];

          target && target.scrollIntoView();
        });
      };

      const observer = new MutationObserver(callback);

      scope.$on('$mdMenuOpen', function() {
        observer.observe(document.body, { childList: true });
      });

      scope.$on('$mdMenuClose', function() {
        observer.disconnect();
      });
    }
  };
}
