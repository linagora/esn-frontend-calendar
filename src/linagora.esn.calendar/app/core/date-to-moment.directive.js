
(function() {
  'use strict';

  angular.module('esn.calendar')
    .directive('calDateToMoment', calDateToMoment);

  function calDateToMoment(calMoment) {
    var directive = {
      restrict: 'A',
      require: 'ngModel',
      link: link
    };

    return directive;

    ////////////

    function link(scope, element, attrs, ngModel) { // eslint-disable-line
      // Ensure that we only are using calMoment type of date in our code.
      ngModel.$parsers.unshift(ensureModelHasCalMoment);

      function ensureModelHasCalMoment(value) {
        var result = calMoment(value);

        return result.isValid() ? result : undefined;
      }
    }
  }

})();
