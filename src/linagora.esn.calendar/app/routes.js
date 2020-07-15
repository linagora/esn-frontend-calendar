require('./sidebar/sidebar.directive.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .config(routesConfig);

  function routesConfig($stateProvider) {
    $stateProvider
      .state('calendar', {
        url: '/calendar',
        template: require("./index.pug"),
        abstract: true,
        resolve: {
          isModuleActive: isModuleActive,
          calendarHomeId: function(calendarHomeService) {
            return calendarHomeService.getUserCalendarHomeId();
          },
          businessHours: function(calBusinessHoursService) {
            return calBusinessHoursService.getUserBusinessHours();
          }
        },
        controller: 'CalCalendarRootController',
        reloadOnSearch: false
      })
      .state('calendar.main', {
        url: '',
        views: {
          content: {
            template: '<cal-calendar calendar-home-id="calendarHomeId" business-hours="businessHours"/>'
          }
        }
      })
      .state('calendar.main.planning', {
        url: '/planning',
        views: {
          'sidebar@calendar.main': {
            template: '<cal-calendar-planning/>'
          }
        }
      })
      .state('calendar.settings', {
        url: '/settings',
         deepStateRedirect: {
          default: 'calendar.settings.calendars',
          fn: function() {
            return { state: 'calendar.settings.calendars' };
          }
        },
        views: {
          'content@calendar': {
            template: require("./settings/settings.pug"),
            controller: 'CalSettingsIndexController'
          }
        }
      })
      .state('calendar.settings.calendars', {
        url: '/calendars',
        views: {
          settings: {
            template: '<cal-settings-calendars />'
          }
        }
      })
      .state('calendar.settings.display', {
        url: '/display',
        views: {
          settings: {
            template: '<cal-settings-display />'
          }
        }
      })
      .state('calendar.edit', {
        url: '/edit/:calendarUniqueId',
        params: {
          addUsersFromDelegationState: null,
          previousState: null
        },
        views: {
          content: {
            template: '<calendar-configuration />'
          }
        }
      })
      .state('calendar.add', {
        url: '/add',
        views: {
          content: {
            template: '<calendar-configuration />'
          }
        }
      })
      .state('calendar.external', {
        url: '/external',
        deepStateRedirect: {
          default: 'calendar.main',
          fn: function() {
            return { state: 'calendar.main' };
          }
        }
      })
      .state('calendar.external.shared', {
        url: '/shared/:calendarUniqueId',
        params: {
          previousState: null
        },
        views: {
          'content@calendar': {
            template: '<calendar-configuration />'
          }
        }
      })
      .state('calendar.event', {
        url: '/:calendarHomeId/event/:eventId?recurrenceId',
        abstract: true,
        views: {
          content: {
            template: '<div ui-view="content"/>'
          }
        },
        params: {
          recurrenceId: null
        },
        resolve: {
          event: function($log, $q, $stateParams, $state, calPathBuilder, calDefaultValue, calEventService, calEventUtils, notificationFactory) {
            var eventPath = calPathBuilder.forEventId($stateParams.calendarHomeId, calDefaultValue.get('calendarId'), $stateParams.eventId);
            var editedEvent = calEventUtils.getEditedEvent();

            if (editedEvent && Object.keys(editedEvent).length) {
              return editedEvent;
            }

            return calEventService.getEvent(eventPath).then(function(event) {
              if ($stateParams.recurrenceId) {
                event = event.getExceptionByRecurrenceId($stateParams.recurrenceId);
              }

              if (!event) {
                return $q.reject(new Error('Event not found', eventPath));
              }

              return event;
            }).catch(function(error) {
              $log.error('Can not display the requested event', error);
              notificationFactory.weakError('Can not display the event');
              $state.go('calendar.main');
            });
          }
        }
      });
  }

  function isModuleActive($location, calendarConfiguration) {
    return calendarConfiguration.get('enabled', true).then(function(isEnabled) {
      if (!isEnabled) {
        $location.path('/');
      }
    }).catch(function() {
      $location.path('/');
    });
  }
})(angular);
