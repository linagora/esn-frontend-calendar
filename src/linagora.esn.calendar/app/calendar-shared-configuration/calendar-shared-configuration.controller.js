(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalCalendarSharedConfigurationController', CalCalendarSharedConfigurationController);

  function CalCalendarSharedConfigurationController(
    $log,
    $q,
    $state,
    _,
    session,
    notificationFactory,
    userUtils,
    uuid4,
    calCalendarRightComparatorService,
    calendarService,
    calendarHomeService,
    CalendarCollectionShell,
    userAndExternalCalendars,
    CAL_CALENDAR_SHARED_INVITE_STATUS,
    CAL_ATTENDEE_OBJECT_TYPE,
    CAL_CALENDAR_SHARED_TYPE) {

    var self = this;
    var noResponseDelegationCalendars;

    self.calendarsPerUser = [];
    self.users = [];
    self.getSelectedCalendars = getSelectedCalendars;
    self.onAddingUser = onAddingUser;
    self.onUserAdded = onUserAdded;
    self.onUserRemoved = onUserRemoved;
    self.addSharedCalendars = addSharedCalendars;
    self.sessionUser = session.user;
    self.CAL_ATTENDEE_OBJECT_TYPE = CAL_ATTENDEE_OBJECT_TYPE;

    $onInit();

    //////////////////////

    function $onInit() {
      getNoResponseDelegationCalendarsForCurrentUser().then(function(noResponseDelegationCalendarsForUser) {
        noResponseDelegationCalendars = new NoResponseDelegationCalendars(noResponseDelegationCalendarsForUser);
      });
    }

    function NoResponseDelegationCalendars(noResponseDelegationCalendars) {
      this._noResponseDelegationCalendars = noResponseDelegationCalendars;
    }

    NoResponseDelegationCalendars.prototype.getCalendarsForUser = function(user) {
      return this._noResponseDelegationCalendars.filter(function(noResponseDelegationCalendar) {
        return noResponseDelegationCalendar.user.id === user.id;
      });
    };

    function filterSubscribedCalendars(userCalendars) {
      return getSubscribedCalendarsForCurrentUser().then(function(subscribedCalendars) {
        var sources = subscribedCalendars.map(function(calendar) {
          return (calendar.source && calendar.source.href) || calendar.delegatedsource;
        });

        return _.filter(userCalendars, function(userCalendar) {
          return !_.contains(sources, userCalendar.source);
        });
      });
    }

    function getSubscribedCalendarsForCurrentUser() {
      return calendarHomeService.getUserCalendarHomeId()
        .then(calendarService.listPersonalAndAcceptedDelegationCalendars)
        .then(function(calendars) {
          var externalCalendars = userAndExternalCalendars(calendars);

          return (externalCalendars.publicCalendars || []).concat(externalCalendars.sharedCalendars || []);
        });
    }

    function getPublicCalendarsForUser(user) {
      return calendarService.listPublicCalendars(user.id).then(function(calendars) {
          return calendars.map(function(calendar) {
            if (calendar.type === 'resource') {
              calendarService.getResourceDescription(calendar).then(function(resourceDescription) {
                user.description = resourceDescription;
              });
            }

            return {
              user: user,
              calendar: calendar,
              source: calendar.href,
              type: CAL_CALENDAR_SHARED_TYPE.PUBLIC
            };
          });
        });
    }

    function getNoResponseDelegationCalendarsForCurrentUser() {
      return calendarService.listDelegationCalendars(session.user._id, 'noresponse')
        .then(function(delegationCalendars) {
          return delegationCalendars.map(function(delegationCalendar) {
            return {
              calendar: delegationCalendar,
              source: delegationCalendar.delegatedsource,
              type: CAL_CALENDAR_SHARED_TYPE.DELEGATION
            };
          });
        })
        .then(function(delegationCalendarsWrappers) {
          delegationCalendarsWrappers.forEach(function(delegationCalendarsWrapper) {
            delegationCalendarsWrapper.calendar.getOwner().then(function(owner) {
              delegationCalendarsWrapper.user = owner;
              delegationCalendarsWrapper.user.displayName = userUtils.displayNameOf(owner);
            });
          });

          return delegationCalendarsWrappers;
        });
    }

    function onUserAdded(user) {
      if (!user || !user.id) {
        return;
      }

      getPublicCalendarsForUser(user)
        .then(function(publicCalendars) {
          return (publicCalendars || []).concat(noResponseDelegationCalendars.getCalendarsForUser(user));
        })
        .then(filterSubscribedCalendars)
        .then(function(allCalendars) {
          var filteredCalendars = _filterDuplicates(allCalendars);

          self.calendarsPerUser = self.calendarsPerUser.concat(filteredCalendars);
        })
        .catch(function(err) {
          $log.error('Can not get shared calendars for user', user.id, err);
        });
    }

    function onAddingUser($tags) {
      return !!$tags.id;
    }

    function onUserRemoved(user) {
      if (!user || !user.id) {
        return;
      }

      _.remove(self.calendarsPerUser, function(calendarPerUser) {
        return calendarPerUser.user.id === user.id;
      });
    }

    function subscribe(calendars) {
      return calendarHomeService
        .getUserCalendarHomeId()
        .then(function(calendarHomeId) {
          return $q.all(calendars.map(function(calendar) {
            var id = uuid4.generate();
            var subscription = CalendarCollectionShell.from({
              color: calendar.color,
              description: calendar.description,
              href: CalendarCollectionShell.buildHref(calendarHomeId, id),
              id: id,
              name: calendar.name,
              source: CalendarCollectionShell.from(calendar)
            });

            return calendarService.subscribe(calendarHomeId, subscription);
          }));
        })
        .then(function() {
          $state.go('calendar.main', {}, { reload: true });
        });
    }

    function acceptInvitation(calendars) {
      return calendarHomeService.getUserCalendarHomeId().then(function(calendarHomeId) {
        return $q.all(calendars.map(function(calendar) {
          return calendarService.updateInviteStatus(calendarHomeId, calendar, {
            invitestatus: CAL_CALENDAR_SHARED_INVITE_STATUS.INVITE_ACCEPTED
          });
        }));
      });
    }

    function _filterDuplicates(calendars) {
      return calendars.reduce(function(accCalendarList, currentCalendar) {
          var duplicateIndex = _.findIndex(accCalendarList, function(tmpCalListItem) {
            return (tmpCalListItem.source === currentCalendar.source);
          });

          if (duplicateIndex >= 0) {
            var chosenOne = calCalendarRightComparatorService.getMostPermissive(session.user._id, currentCalendar, accCalendarList[duplicateIndex]);

            if (chosenOne === currentCalendar) {
              accCalendarList.splice(duplicateIndex, 1, chosenOne);
            }
          } else {
            accCalendarList.push(currentCalendar);
          }

          return accCalendarList;
        },
        []
      );
    }

    function subscribeToSelectedCalendars() {
      var selectedCalendars = getSelectedCalendars(_getPublicCalendars(self.calendarsPerUser));

      return selectedCalendars.length && subscribe(selectedCalendars);
    }

    function acceptInvitationToSelectedCalendars() {
      var selectedCalendars = getSelectedCalendars(_getDelegationCalendars(self.calendarsPerUser));

      return selectedCalendars.length && acceptInvitation(selectedCalendars);
    }

    function getSelectedCalendars(calendars) {
      return _(calendars)
        .filter('isSelected')
        .map(function(selected) {
          return selected.calendar;
        })
        .value();
    }

    function _getPublicCalendars(userCalendars) {
      return _.filter(userCalendars, { type: 'public' });
    }

    function _getDelegationCalendars(userCalendars) {
      return _.filter(userCalendars, { type: 'delegation' });
    }

    function addSharedCalendars() {
      $q.all([
        subscribeToSelectedCalendars(),
        acceptInvitationToSelectedCalendars()
      ])
      .then(function() {
        notificationFactory.weakInfo('Shared calendars', 'Successfully added shared calendar' + (getSelectedCalendars(self.calendarsPerUser).length > 1 ? 's' : ''));
      }, function() {
        notificationFactory.weakError('Shared calendars', 'Can not add shared calendar' + (getSelectedCalendars(self.calendarsPerUser).length > 1 ? 's' : ''));
      });
    }
  }
})();
