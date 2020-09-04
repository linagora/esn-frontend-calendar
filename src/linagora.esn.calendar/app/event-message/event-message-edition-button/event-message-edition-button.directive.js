(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .directive('calEventMessageEditionButton', calEventMessageEditionButton);

  function calEventMessageEditionButton() {
    var directive = {
      restrict: 'E',
      template: require('./event-message-edition-button.pug'),
      replace: true
    };

    return directive;
  }

})(angular);
