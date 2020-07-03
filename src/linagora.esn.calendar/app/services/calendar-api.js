(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calendarAPI', calendarAPI);

  var JSON_CONTENT_TYPE_HEADER = { 'Content-Type': 'application/json' };

  function calendarAPI(
    $q,
    calendarRestangular,
    calPathBuilder,
    calDavRequest,
    calHttpResponseHandler,
    notificationFactory,
    _,
    CAL_ACCEPT_HEADER,
    CAL_DAV_DATE_FORMAT,
    CALENDAR_PREFER_HEADER,
    CALENDAR_CONTENT_TYPE_HEADER
  ) {

    return {
      listEvents: listEvents,
      searchEvents: searchEvents,
      getEventByUID: getEventByUID,
      listCalendars: listCalendars,
      getCalendar: getCalendar,
      listEventsForCalendar: listEventsForCalendar,
      createCalendar: createCalendar,
      removeCalendar: removeCalendar,
      getRight: getRight,
      modifyCalendar: modifyCalendar,
      modifyShares: modifyShares,
      changeParticipation: changeParticipation,
      modifyPublicRights: modifyPublicRights
    };

    ////////////

    function responseHandler(key) {
      return calHttpResponseHandler([200], function(response) {
        return (response.data && response.data._embedded && response.data._embedded[key]) || [];
      });
    }

    /**
     * Query one or more calendars for events in a specific range. The dav:calendar resources will include their dav:item resources.
     * @param  {String}   calendarHref The href of the calendar.
     * @param  {calMoment} start        calMoment type of Date, specifying the start of the range.
     * @param  {calMoment} end          calMoment type of Date, specifying the end of the range.
     * @return {Object}                An array of dav:items items.
     */
    function listEvents(calendarHref, start, end) {
      var body = {
        match: {
          start: start.format(CAL_DAV_DATE_FORMAT),
          end: end.format(CAL_DAV_DATE_FORMAT)
        }
      };

      return calDavRequest('report', calendarHref, JSON_CONTENT_TYPE_HEADER, body)
      .then(responseHandler('dav:item'));
    }

    /**
     * Search for indexed events depending on the search options. The dav:calendar resources will include their dav:item resources.
     * @method searchEvents
     * @param {Object} options the search options
     * @param {[CalendarCollectionShell]} options.calendars the array of CalendarCollectionShell to search in
     * @param {number} options.offset the starting position to search from
     * @param {number} options.limit the maximum number of events to be returned
     * @param {Object} options.query the search query options
     * @param {Object} options.sortKey the key to sort the result
     * @param {Object} options.sortOrder the order to sort the result by the key
     * @param {Object} options.query.advanced the advanced search options
     * @param {string} options.query.advanced.contains the string to be found in the events' properties
     * @param {Array} [options.query.advanced.organizers] the array of organizers to search with
     * @param {Array} [options.query.advanced.attendees] the array of attendees to search with
     * @return {Object} an array of dav:item items
     */
    function searchEvents(options) {
      var calendars = options.calendars.map(function(calendar) {
        if (calendar.source) {
          return {
            userId: calendar.source.calendarHomeId,
            calendarId: calendar.source.id
          };
        }

        return {
          userId: calendar.calendarHomeId,
          calendarId: calendar.id
        };
      });

      options.query.advanced = options.query.advanced || {};

      var requestBody = {
        calendars: calendars,
        query: options.query.advanced.contains || options.query.text || ''
      };

      if (options.query.advanced.organizers) {
        requestBody.organizers = options.query.advanced.organizers.map(function(organizer) {
          return organizer.email;
        });
      }

      if (options.query.advanced.attendees) {
        requestBody.attendees = options.query.advanced.attendees.map(function(attendee) {
          return attendee.email;
        });
      }

      return calendarRestangular.all('events').one('search').customPOST(requestBody, undefined, {
        offset: options.offset,
        limit: options.limit,
        sortKey: options.sortKey,
        sortOrder: options.sortOrder
      }).then(responseHandler('events'));
    }

    /**
     * Queries all calendars of the logged-in user's calendar home for an event with the given _uid_.
     *
     * @param calendarHomeId {String} The calendar home ID to search in
     * @param uid {String} The event UID to search.
     *
     * @return {Array} The array of dav:items
     */
    function getEventByUID(calendarHomeId, uid) {
      return calDavRequest('report', calPathBuilder.forCalendarHomeId(calendarHomeId), JSON_CONTENT_TYPE_HEADER, { uid: uid }).then(responseHandler('dav:item'));
    }

    /**
     * Query one or more calendars for events. The dav:calendar resources will include their dav:item resources.
     * @param  {String}   calendarHomeId The calendarHomeId.
     * @param  {String}   calendarId     The calendarId.
     * @param  {calMoment} start          calMoment type of Date, specifying the start of the range.
     * @param  {calMoment} end            calMoment type of Date, specifying the end of the range.
     * @return {Object}                  An array of dav:item items.
     */
    function listEventsForCalendar(calendarHomeId, calendarId, start, end) {
      var body = {
        match: {
          start: start.format(CAL_DAV_DATE_FORMAT),
          end: end.format(CAL_DAV_DATE_FORMAT)
        }
      };
      var path = calPathBuilder.forCalendarId(calendarHomeId, calendarId);

      return calDavRequest('report', path, JSON_CONTENT_TYPE_HEADER, body)
      .then(responseHandler('dav:item'));
    }

    /**
     * List all calendars in the calendar home. A dav:home resource, containing all dav:calendar resources in it.
     * @param  {String} calendarId The calendarHomeId.
     * @param  {object} options    options for more data
     * @return {Object}                An array of dav:calendar
     */
    function listCalendars(calendarId, options) {
      var path = calPathBuilder.forCalendarHomeId(calendarId);

      return calDavRequest('get', path, {Accept: CAL_ACCEPT_HEADER}, {}, options)
      .then(responseHandler('dav:calendar'));
    }

    /**
     * Get a calendar (dav:calendar).
     * @param  {String} calendarHomeId The calendarHomeId.
     * @param  {String} calendarId     The calendarId.
     * @return {Object} An array of dav:calendar
     */
    function getCalendar(calendarHomeId, calendarId, options) {
      var path = calPathBuilder.forCalendarId(calendarHomeId, calendarId);

      return calDavRequest('get', path, {Accept: CAL_ACCEPT_HEADER}, {}, options)
      .then(calHttpResponseHandler(200, _.property('data')));
    }

    /**
     * Create a calendar in the specified calendar home.
     * @param  {String}         calendarHomeId   The calendar home id in which to create a new calendar
     * @param  {ICAL.Component} calendar      A dav:calendar object, with an additional member "id" which specifies the id to be used in the calendar url.
     * @return {Object}                        the http response.
     */
    function createCalendar(calendarHomeId, calendar) {
      var path = calPathBuilder.forCalendarHomeId(calendarHomeId);

      return calDavRequest('post', path, null, calendar)
      .then(calHttpResponseHandler(201))
      .catch(function(error) {
        notificationFactory.weakError('Failed to create calendar', 'Cannot join the server, please try later');

        return $q.reject(error);
      });
    }

    /**
     * Delete a calendar in the specified calendar home.
     * @param  {String}         calendarHomeId   The calendar home id in which to delete a new calendar
     * @param  {ICAL.Component} calendarId      A dav:calendar object, with an additional member "id" which specifies the id to be used in the calendar url.
     * @return {Object}                        the http response.
     */
    function removeCalendar(calendarHomeId, calendarId) {
      var path = calPathBuilder.forCalendarId(calendarHomeId, calendarId);

      return calDavRequest('delete', path)
      .then(calHttpResponseHandler(204))
      .catch(function(error) {
        notificationFactory.weakError('Failed to remove calendar', 'Cannot join the server, please try later');

        return $q.reject(error);
      });
    }

    /**
     * Modify a calendar in the specified calendar home.
     * @param  {String}         calendarHomeId   The calendar home id in which to create a new calendar
     * @param  {ICAL.Component} calendar      A dav:calendar object, with an additional member "id" which specifies the id to be used in the calendar url.
     * @return {Object}                        the http response.
     */
    function modifyCalendar(calendarHomeId, calendar) {
      var path = calPathBuilder.forCalendarId(calendarHomeId, calendar.id);

      return calDavRequest('proppatch', path, JSON_CONTENT_TYPE_HEADER, calendar)
      .then(calHttpResponseHandler(204))
      .catch(function(error) {
        notificationFactory.weakError('Failed to modify calendar', 'Cannot join the server, please try later');

        return $q.reject(error);
      });
    }

    /**
     * Get right of this calendar
     * @param  {String}         calendarHomeId   The calendar home id in which to create a new calendar
     * @param  {ICAL.Component} calendar      A dav:calendar object, with an additional member "id" which specifies the id to be used in the calendar url.
     * @return {Object}                        the http response body.
     */
    function getRight(calendarHomeId, calendar) {
      var path = calPathBuilder.forCalendarId(calendarHomeId, calendar.id);

      return calDavRequest('propfind', path, JSON_CONTENT_TYPE_HEADER, {
        prop: ['cs:invite', 'acl']
      }).then(calHttpResponseHandler(200, _.property('data')));
    }

    /**
     * Modify the public rights of a calendar in the specified calendar home.
     * @param  {String}  calendarHomeId  The calendar home id in which to create a new calendar
     * @param  {String} calendarId  The id of the calendar which its public right will be modified
     * @param  {Object} publicRights: the public rights
     * @return {Object} the http response body.
     */
    function modifyPublicRights(calendarHomeId, calendarId, publicRights) {
      var path = calPathBuilder.forCalendarId(calendarHomeId, calendarId);

      return calDavRequest('acl', path, JSON_CONTENT_TYPE_HEADER, publicRights).then(calHttpResponseHandler(200));
    }

    /**
     * Modify the rights for a calendar in the specified calendar home.
     * @param  {String} calendarHomeId  The calendar home id in which to create a new calendar
     * @param  {String} calendarId  The id of the calendar which will be modified
     * @param  {Object} rights
     * @return {Object} the http response.
     */
    function modifyShares(calendarHomeId, calendarId, body) {
      var path = calPathBuilder.forCalendarId(calendarHomeId, calendarId);

      return calDavRequest('post', path, null, body).then(calHttpResponseHandler(200));
    }

    /**
     * PUT request used to change the participation status of an event
     * @param  {String}         eventPath path of the event. The form is /<calendar_path>/<uuid>.ics
     * @param  {ICAL.Component} vcalendar a vcalendar object including the vevent to create.
     * @param  {String}         etag      set the If-Match header to this etag before sending the request
     * @return {Object}                   the http response.
     */
    function changeParticipation(eventPath, vcalendar, etag) {
      var headers = {
        'Content-Type': CALENDAR_CONTENT_TYPE_HEADER,
        Prefer: CALENDAR_PREFER_HEADER
      };

      if (etag) {
        headers['If-Match'] = etag;
      }
      var body = vcalendar.toJSON();

      return calDavRequest('put', eventPath, headers, body)
      .then(calHttpResponseHandler([200, 204]));
    }
  }
})();
