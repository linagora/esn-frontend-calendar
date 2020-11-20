'use strict';

const jwtDecode = require('jwt-decode');

angular.module('esn.calendar.libs')
  .service('calPartstatJWTService', calPartstatJWTService);

/**
 * This service contains the methods to change the participation status of a user for an event via a jwt
 */
function calPartstatJWTService($q, $http, $log, httpConfigurer, calEventService, calendarHomeService, calOpenEventForm, notificationFactory, calPartstatUpdateNotificationService) {
  return {
    changeParticipationUsingJWTAndDisplayEvent,
    changeParticipationUsingJWT,
    getChangeParticipationURL
  };

  /**
   * Change a user's participation status for an event using a jwt and display the event details afterwards
   * @param {String} jwt    The jwt that contains the information to change the user's participation status for an event
   * @returns {Promise}     A promise that resolves when the process to change the participation status using a jwt finishes
   */
  function changeParticipationUsingJWTAndDisplayEvent(jwt) {
    if (!jwt) {
      const error = new Error('There is no jwt to change the participation status');

      $log.error(error);
      notificationFactory.weakError('', 'Event participation modification failed');

      return $q.reject(error);
    }

    const { uid: eventUid, action } = jwtDecode.default(jwt);

    return changeParticipationUsingJWT(jwt)
      .then(() => {
        calPartstatUpdateNotificationService(action);

        return calendarHomeService.getUserCalendarHomeId()
          .then(calendarHomeId => calEventService.getEventByUID(calendarHomeId, eventUid))
          .then(event => calOpenEventForm(null, event))
          .catch(err => {
            $log.error('Cannot display the requested event', err);
            notificationFactory.weakError('', 'Cannot display the event');
          });
      })
      .catch(err => {
        $log.error('Something went wrong while changing the participation status', err);
        notificationFactory.weakError('', 'Event participation modification failed');
      });
  }

  /**
   * Send a request to change a user's participation status for an event using a jwt
   * @param {String} jwt    The jwt that contains the information to change the user's participation status for an event
   * @returns {Promise}     A promise that resolves when the request to change the participation status completes
   */
  function changeParticipationUsingJWT(jwt) {
    return $http({ method: 'GET', url: getChangeParticipationURL(jwt) });
  }

  /**
   * Get the url to change a user's participation status for an event using a jwt
   * @param {String} jwt    The jwt that contains the information to change the user's participation status for an event
   * @returns {String}      The url to change the participation status
   */
  function getChangeParticipationURL(jwt) {
    return `${httpConfigurer.getUrl('/calendar/api/calendars/event/participation')}?jwt=${jwt}`;
  }
}
