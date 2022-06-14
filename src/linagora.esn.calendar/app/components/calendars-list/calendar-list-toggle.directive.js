
'use strict';

angular.module('esn.calendar')

  .directive('calendarListToggle', function(TOGGLE_TRANSITION) {

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        if (attrs.toggled === 'true') {
          _toggle(0);
        }

        element.click(function() {
          _toggle(TOGGLE_TRANSITION);
        });

        function _toggle(toggleTransistion) {
          element.parent().parent().parent().toggleClass('toggled');
          element.parent().parent().parent().find('ul:not(".not-toggled")').stop(true, false).slideToggle(toggleTransistion);
        }
      }
    };
  });
