'use strict';

require('./sidebar/sidebar.directive.js');

angular.module('esn.calendar')
  .config(routesConfig);

function routesConfig($stateProvider) {
  $stateProvider
    .state('calendar', {
      url: '/calendar',
      template: require('./index.pug'),
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
      default: true,
      views: {
        content: {
          template: '<cal-calendar calendar-home-id="calendarHomeId" business-hours="businessHours"/>'
        }
      }
    })
    .state('calendar.main.participation', {
      url: '/participation',
      onEnter: function($state, $location, calPartstatJWTService) {
        const { jwt } = $location.search();

        $state.go('calendar.main');

        calPartstatJWTService.changeParticipationUsingJWTAndDisplayEvent(jwt);
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
    .state('calendar.main.settings', {
      url: '/settings',
      deepStateRedirect: {
        default: 'calendar.main.settings.calendars',
        fn: function() {
          return { state: 'calendar.main.settings.calendars' };
        }
      },
      resolve: {
        modalInstance: function($modal) {
          return $modal({
            template: require('./settings/settings.pug'),
            controller: 'CalSettingsIndexController',
            backdrop: 'static',
            keyboard: false
          });
        }
      },
      onEnter: function($rootScope, $state, calSettingsService, modalInstance, UPDATE_CAL_SETTINGS, CAL_SETTINGS_STATUS) {
        let isSettingUpdated = false;

        calSettingsService.setForceUpdate(false);

        const unregisterCalSettingsUpdate = $rootScope.$on(UPDATE_CAL_SETTINGS, function(event, newStatus) {
          if (newStatus !== CAL_SETTINGS_STATUS.UPDATED) return;

          isSettingUpdated = true;
        });

        const unregisterStateChange = $rootScope.$on('$stateChangeSuccess',
          function(event, toState) {
            if (toState.name.includes('calendar.main.settings')) return;
            if (toState.name.includes('calendar.main.edit')) return;
            if (toState.name.includes('calendar.main.external')) return;

            unregisterCalSettingsUpdate();
            unregisterStateChange();

            modalInstance.hide();

            if (isSettingUpdated) {
              return $state.reload();
            }

            calSettingsService.setForceUpdate(true);
          });
      }
    })
    .state('calendar.main.settings.calendars', {
      url: '/calendars',
      views: {
        'settings@': {
          template: '<cal-settings-calendars />'
        }
      }
    })
    .state('calendar.main.settings.display', {
      url: '/display',
      views: {
        'settings@': {
          template: '<cal-settings-display />'
        }
      }
    })
    .state('calendar.main.edit', {
      url: '/edit/:calendarUniqueId',
      params: {
        addUsersFromDelegationState: null,
        previousState: null
      },
      onEnter: function($rootScope, $modal) {
        $rootScope.editCalendarModal = $modal({
          template: '<calendar-configuration />',
          keyboard: false,
          backdrop: 'static'
        });
      },
      onExit: function($rootScope) {
        $rootScope.editCalendarModal.hide();
      }
    })
    .state('calendar.main.add', {
      url: '/add',
      resolve: {
        modalInstance: function($modal) {
          return $modal({
            template: '<calendar-configuration />',
            keyboard: false
          });
        }
      },
      onExit: function(modalInstance) {
        modalInstance.hide();
      }
    })
    .state('calendar.main.external', {
      url: '/external',
      deepStateRedirect: {
        default: 'calendar.main',
        fn: function() {
          return { state: 'calendar.main' };
        }
      }
    })
    .state('calendar.main.external.shared', {
      url: '/shared/:calendarUniqueId',
      params: {
        previousState: 'calendar.main'
      },
      resolve: {
        modalInstance: function($modal) {
          return $modal({
            template: '<calendar-configuration />',
            backdrop: 'static',
            keyboard: false
          });
        }
      },
      onExit: function(modalInstance) {
        modalInstance.hide();
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
    })
    .state('home', {
      onEnter: function($state, $timeout) {
        $timeout(() => {
          $state.go('calendar.main');
        });
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
