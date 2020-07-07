require('../../../constants.js');
require('../../../services/event-service.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .factory('calEventDateSuggestionModal', calEventDateSuggestionModal);

  function calEventDateSuggestionModal(
    $rootScope,
    $modal,
    notificationFactory,
    calEventService,
    CAL_EVENTS
  ) {
    var modalIsOpen = false;

    return function(event) {
      if (modalIsOpen === false) {
        modalIsOpen = true;
        $modal({
          template: require("./event-date-suggestion-modal.pug"),
          resolve: {
            event: function() {
              return event.clone();
            }
          },
          controller: function($scope, event) {
            var _$hide = $scope.$hide;

            var unregister = $rootScope.$on(CAL_EVENTS.MODAL + '.hide', function() {
              modalIsOpen = false;
            });

            $scope.$hide = hide;
            $scope.event = event;
            $scope.submit = function() {
              calEventService.sendCounter($scope.event).then(function() {
                notificationFactory.weakInfo('Calendar', 'Your proposal has been sent');
                hide();
              })
              .catch(function() {
                notificationFactory.weakError('Calendar', 'An error occurred, please try again');
              });
            };

            function hide() {
              _$hide.apply(this, arguments);
              modalIsOpen = false;
              unregister && unregister();
            }
          },
          backdrop: 'static',
          placement: 'center',
          prefixEvent: CAL_EVENTS.MODAL
        });
      }
    };
  }
})(angular);
