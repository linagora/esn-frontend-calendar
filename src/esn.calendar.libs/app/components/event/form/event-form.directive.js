require('./event-form.controller');

'use strict';

angular.module('esn.calendar.libs')
  .directive('calEventForm', calEventForm);

function calEventForm() {
  var directive = {
    restrict: 'E',
    template: require('./event-form.pug'),
    link: link,
    replace: true,
    controller: 'CalEventFormController'
  };

  return directive;

  ////////////

  function link(scope, element) {
    element.children().draggable({
      handle: '.modal-header, .modal-footer'
    });

    scope.$on('$locationChangeStart', hideModal);

    function hideModal(event) {
      if (scope.$isShown) {
        event.preventDefault();
        scope.$hide();
      }
    }
  }
}
