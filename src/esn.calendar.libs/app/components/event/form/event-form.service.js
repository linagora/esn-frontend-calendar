require('../../../services/calendar-service.js');
require('../../../services/cal-ui-authorization-service.js');
require('../../../services/event-utils.js');
require('../../../app.constants.js');

'use strict';

angular.module('esn.calendar.libs')
  .factory('calEventFormService', calEventFormServiceFactory);

/**
 * There are 2 types of form in the module:
 *   * The event form: this is a desktop and mobile view of an complete edition form for events.
 *   * The consult form: this is a desktop and mobile view of an consult form for events.
 * Note that mobile devices have only access to the full form and the consult form.
 * This service will open the correct form corresponding to the event and the screen size.
 */
function calEventFormServiceFactory($rootScope, $modal, calendarService, calUIAuthorizationService, notificationFactory, calEventUtils, session, CAL_EVENTS) {
  var modalIsOpen = false;

  return {
    openEventForm: openEventForm
  };

  function openEventForm(calendarHomeId, calendarId, event, relatedEvents) {
    calendarService.getCalendar(calendarHomeId, calendarId).then(function(calendar) {
      if (!calUIAuthorizationService.canAccessEventDetails(calendar, event, session.user._id)) {
        return notificationFactory.weakInfo('Private event', 'Cannot access private event');
      }

      if (!calUIAuthorizationService.canModifyEvent(calendar, event, session.user._id) || !event.isInstance()) {
        return _openNormalModal(calendar, event, relatedEvents);
      }

      _openRecurringModal(calendar, event, relatedEvents);
    });
  }

  function _openNormalModal(calendar, event, relatedEvents) {
    calEventUtils.setEditedEvent(event);

    if (modalIsOpen) return;

    modalIsOpen = true;
    $modal({
      template: require("./modals/event-form-modal.pug"),
      resolve: {
        event: function() {
          return calEventUtils.getEditedEvent();
        },
        relatedEvents: function() {
          return relatedEvents;
        }
      },
      controller: /* @ngInject */ function($scope, event, relatedEvents) {
        var _$hide = $scope.$hide;

        var unregister = $rootScope.$on(CAL_EVENTS.MODAL + '.hide', function() {
          $rootScope.$broadcast(CAL_EVENTS.CALENDAR_UNSELECT);
          $scope.cancel && $scope.cancel();
        });

        $scope.$hide = function() {
          _$hide.apply(this, arguments);
          modalIsOpen = false;
          unregister && unregister();
        };

        $scope.event = event;
        $scope.relatedEvents = relatedEvents;
        $scope.calendarHomeId = session.user._id;
      },
      backdrop: 'static',
      placement: 'center',
      prefixEvent: CAL_EVENTS.MODAL
    });
  }

  function _openRecurringModal(calendar, event, relatedEvents) {
    $modal({
      template: require("./modals/edit-instance-or-series-modal.pug"),
      resolve: {
        calendar: function() {
          return calendar;
        },
        event: function() {
          return event;
        },
        relatedEvents: function() {
          return relatedEvents;
        },
        openForm: function() {
          return _openNormalModal;
        }
      },
      controller: /* @ngInject */ function($scope, calendar, event, openForm, relatedEvents) {
        $scope.event = event;
        $scope.relatedEvents = relatedEvents;
        $scope.calendarHomeId = calendar.calendarHomeId;
        $scope.editChoice = 'this';

        $scope.submit = function() {
          $scope.$hide();

          ($scope.editChoice === 'this' ? editInstance : editAllInstances)();
        };

        function editAllInstances() {
          if (event.fetchFullEvent) {
            if (event.recurrenceId) delete event.recurrenceId;

            return openForm(calendar, event, relatedEvents);
          }

          event.getModifiedMaster(true).then(function(eventMaster) {
            openForm(calendar, eventMaster, relatedEvents);
          });
        }

        function editInstance() {
          openForm(calendar, event, relatedEvents);
        }
      },
      placement: 'center'
    });
  }
}