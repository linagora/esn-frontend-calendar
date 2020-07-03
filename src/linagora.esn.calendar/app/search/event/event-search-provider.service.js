(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calSearchEventProviderService', calSearchEventProviderService);

  function calSearchEventProviderService(
    $q,
    _,
    calendarHomeService,
    calendarService,
    calEventService,
    esnSearchProvider,
    calMoment,
    userAndExternalCalendars,
    ELEMENTS_PER_REQUEST,
    CAL_ADVANCED_SEARCH_CALENDAR_TYPES
  ) {

    return function() {
      return calendarHomeService.getUserCalendarHomeId().then(buildProvider);
    };

    function buildProvider(calendarHomeId) {
      return new esnSearchProvider({
        uid: 'op.events',
        name: 'Events',
        fetch: function(query) {
          var offset = 0;

          return function() {
            var options = {
              query: query,
              offset: offset,
              limit: ELEMENTS_PER_REQUEST
            };

            var eventSearch = calendarService.listPersonalAndAcceptedDelegationCalendars(calendarHomeId)
              .then(function(calendars) {
                if (!query.advanced || _.isEmpty(query.advanced) || !query.advanced.cal) {
                  options.calendars = calendars;

                  return _searchEvents(options);
                }

                switch (query.advanced.cal) {
                  case CAL_ADVANCED_SEARCH_CALENDAR_TYPES.ALL_CALENDARS:
                    options.calendars = calendars;
                    break;
                  case CAL_ADVANCED_SEARCH_CALENDAR_TYPES.MY_CALENDARS:
                    options.calendars = userAndExternalCalendars(calendars).userCalendars;
                    break;
                  case CAL_ADVANCED_SEARCH_CALENDAR_TYPES.SHARED_CALENDARS:
                    var categorizedCalendars = userAndExternalCalendars(calendars);

                    options.calendars = (categorizedCalendars.publicCalendars || [])
                      .concat(categorizedCalendars.sharedCalendars || []);
                    break;
                  default:
                    options.calendars = calendars.filter(function(calendar) {
                      return calendar.id === query.advanced.cal;
                    });
                }

                return _searchEvents(options);
              });

            return eventSearch
              .then(function(arrayOfPromisedResultEvents) {
                return _.sortBy(_.flatten(arrayOfPromisedResultEvents), function(event) { return -event.date; });
              });
          };

          function _searchEvents(options) {
            return calEventService.searchEvents(options)
              .then(function(events) {
                offset += events.length;

                return events.map(function(event) {
                  event.calendar = _.find(options.calendars, function(calendar) {
                    return calendar.source ? calendar.source.id === event.calendarId : calendar.id === event.calendarId;
                  });
                  event.type = name;
                  _injectEventPropertiesForDisplay(event);

                  return event;
                });
              });
          }

          function _injectEventPropertiesForDisplay(event) {
            event.start = calMoment(event.start);
            event.end = calMoment(event.end);
            event.date = event.start;
            event.full24HoursDay = event.allDay;

            event.isOverOneDayOnly = function() {
              return event.end.diff(event.start) <= 86400000;
            };
          }
        },
        buildFetchContext: function(options) { return $q.resolve(options.query); },
        cleanQuery: function(query) {
          function _getCleanedEntities(entities) {
            return entities.map(function(entity) {
              return {
                email: entity.email,
                displayName: entity.displayName
              };
            });
          }

          function _cleanEntityFilter(entityFilterKey) {
            if (Array.isArray(query.advanced[entityFilterKey]) && !query.advanced[entityFilterKey].length) {
              return delete query.advanced[entityFilterKey];
            }

            query.advanced[entityFilterKey] = _getCleanedEntities(query.advanced[entityFilterKey]);
          }

          if (!query || !query.advanced) {
            return query;
          }

          if (query.advanced.organizers) {
            _cleanEntityFilter('organizers');
          }

          if (query.advanced.attendees) {
            _cleanEntityFilter('attendees');
          }

          return query;
        },
        templateUrl: '/calendar/app/search/event/event-search-item.html',
        searchTemplateUrl: '/calendar/app/search/form/search-form-template.html',
        activeOn: ['calendar'],
        placeHolder: 'Search in events'
      });
    }
  }
})();
