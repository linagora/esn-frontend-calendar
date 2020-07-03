(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .factory('calAttendeeService', calAttendeeService);

  function calAttendeeService($log, $q, _, userUtils, CAL_ICAL, calResourceService, calAttendeesCache) {
    return {
      filterDuplicates: filterDuplicates,
      getAttendeeForUser: getAttendeeForUser,
      getUserIdForAttendee: getUserIdForAttendee,
      getUserDisplayNameForAttendee: getUserDisplayNameForAttendee,
      getUsersIdsForAttendees: getUsersIdsForAttendees,
      manageResourceDetailsPromiseResolutions: manageResourceDetailsPromiseResolutions,
      logResourceDetailsError: logResourceDetailsError,
      splitAttendeesFromType: splitAttendeesFromType,
      splitAttendeesFromTypeWithResourceDetails: splitAttendeesFromTypeWithResourceDetails,
      userAsAttendee: userAsAttendee,
      emailAsAttendee: emailAsAttendee
    };

    function filterDuplicates(attendees) {
      var attendeesMap = {};

      attendees.forEach(function(attendee) {
        if (!attendeesMap[attendee.email] || !attendeesMap[attendee.email].partstat) {
          attendeesMap[attendee.email] = attendee;
        }
      });

      return _.values(attendeesMap);
    }

    function getAttendeeForUser(attendees, user) {
      if (!user || !attendees) {
        return;
      }

      return _.find(attendees, function(attendee) {
        return _.contains(user.emails, attendee.email);
      });
    }

    function getUserIdForAttendee(attendee) {
      return calAttendeesCache.get(attendee.email).then(function(user) {
        if (user) {
          return user._id;
        }
      });
    }

    // Since clients can create events with attendees defined as email only:
    // if the user is an openpaas one, get the openpaas display name, else get it from the attendee ICS
    function getUserDisplayNameForAttendee(attendee) {
      var name = attendee.displayName || attendee.name;

      return calAttendeesCache.get(attendee.email).then(function(user) {
        return user ? userUtils.displayNameOf(user) || name : name;
      }).catch(function() {
        return $q.when(name);
      });
    }

    function getUsersIdsForAttendees(attendees) {
      var promises = attendees.map(function(attendee) {
        return getUserIdForAttendee(attendee);
      });

      return $q.allSettled(promises)
        .then(function(results) {
          return _.map(_.filter(results, {state: 'fulfilled'}), 'value');
        });
    }

    function splitAttendeesFromType(attendees, resourcesTypeCallback) {
      var result = { users: [], resources: [] };

      (attendees || []).forEach(function(attendee) {
        if (!attendee.cutype || attendee.cutype === CAL_ICAL.cutype.individual) {
          result.users.push(attendee);
        }

        if (attendee.cutype === CAL_ICAL.cutype.resource) {
          var resource = resourcesTypeCallback ? resourcesTypeCallback(attendee) : attendee;

          result.resources.push(resource);
        }
      });

      return result;
    }

    function splitAttendeesFromTypeWithResourceDetails(attendees) {
      return $q
        .allSettled((attendees || []).reduce(function(resources, attendee) {
          if (attendee.cutype === CAL_ICAL.cutype.resource && attendee.email) {
            resources.push(calResourceService.getResource(attendee.email.split('@')[0]));
          }

          return resources;
        }, []))
        .then(function(promises) {
          return manageResourceDetailsPromiseResolutions(promises);
        })
        .then(function(resources) {
          return splitAttendeesFromType(attendees, function(attendee) {
            var resource = attendee.email ?
                _.find(resources, { _id: attendee.email.split('@')[0]}) :
                undefined;
            var result = resource ?
                _.assign({}, attendee, { deleted: resource.deleted }) :
                attendee;

            return result;
          });
        })
        .catch(function(error) {
          logResourceDetailsError(error);

          return splitAttendeesFromType(attendees);
        });
    }

    function manageResourceDetailsPromiseResolutions(promises) {
      var fulfilledPromises = _.map(
        _.filter(promises, {state: 'fulfilled'}),
        'value'
      );
      var rejectedPromises = _.map(
        _.filter(promises, {state: 'rejected'}),
        'reason'
      );

      if (!fulfilledPromises.length && rejectedPromises.length) {
        return $q.reject(rejectedPromises);
      }

      if (rejectedPromises.length > 0) {
        rejectedPromises.forEach(function(error) { logResourceDetailsError(error); });
      }

      return $q.when(fulfilledPromises);
    }

    function logResourceDetailsError(error) {
      $log.error('Could not retrieve resources details', error);
    }

    function userAsAttendee(user) {
      user.email = user.preferredEmail;
      user.displayName = userUtils.displayNameOf(user);
      user.cutype = CAL_ICAL.cutype.individual;

      return user;
    }

    function emailAsAttendee(email) {
      return {
        email: email,
        displayName: email,
        cutype: CAL_ICAL.cutype.individual
      };
    }
  }
})(angular);
