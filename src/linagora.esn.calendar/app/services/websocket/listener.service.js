(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calWebsocketListenerService', calWebsocketListenerService);

  function calWebsocketListenerService(
    $q,
    $log,
    livenotification,
    calCachedEventSource,
    calUIAuthorizationService,
    session,
    calPathParser,
    calendarEventEmitter,
    calendarService,
    calMasterEventCache,
    CalendarShell,
    CAL_ICAL,
    CAL_WEBSOCKET
  ) {

    return {
      listenEvents: listenEvents
    };

    function listenEvents() {
      var sio = livenotification(CAL_WEBSOCKET.NAMESPACE);

      sio.on(CAL_WEBSOCKET.EVENT.CREATED, _onEventCreateRequestOrUpdate.bind(null, CAL_WEBSOCKET.EVENT.CREATED));
      sio.on(CAL_WEBSOCKET.EVENT.REQUEST, _onEventCreateRequestOrUpdate.bind(null, CAL_WEBSOCKET.EVENT.REQUEST));
      sio.on(CAL_WEBSOCKET.EVENT.CANCEL, _onEventCancelled.bind(null, CAL_WEBSOCKET.EVENT.CANCEL));
      sio.on(CAL_WEBSOCKET.EVENT.UPDATED, _onEventCreateRequestOrUpdate.bind(null, CAL_WEBSOCKET.EVENT.UPDATED));
      sio.on(CAL_WEBSOCKET.EVENT.DELETED, _onEventDeleted.bind(null, CAL_WEBSOCKET.EVENT.DELETED));
      sio.on(CAL_WEBSOCKET.EVENT.REPLY, _onEventReply.bind(null, CAL_WEBSOCKET.EVENT.REPLY));
      sio.on(CAL_WEBSOCKET.CALENDAR.CREATED, _onCalendarCreated.bind(null, CAL_WEBSOCKET.CALENDAR.CREATED));
      sio.on(CAL_WEBSOCKET.CALENDAR.UPDATED, _onCalendarUpdated.bind(null, CAL_WEBSOCKET.CALENDAR.UPDATED));
      sio.on(CAL_WEBSOCKET.CALENDAR.DELETED, _onCalendarDeleted.bind(null, CAL_WEBSOCKET.CALENDAR.DELETED));
      sio.on(CAL_WEBSOCKET.SUBSCRIPTION.CREATED, _onCalendarCreated.bind(null, CAL_WEBSOCKET.SUBSCRIPTION.CREATED));
      sio.on(CAL_WEBSOCKET.SUBSCRIPTION.UPDATED, _onCalendarUpdated.bind(null, CAL_WEBSOCKET.SUBSCRIPTION.UPDATED));
      sio.on(CAL_WEBSOCKET.SUBSCRIPTION.DELETED, _onCalendarDeleted.bind(null, CAL_WEBSOCKET.SUBSCRIPTION.DELETED));

      return {
        sio: sio
      };

      function getEventPath(msg) {
        return msg.eventSourcePath ? msg.eventSourcePath : msg.eventPath;
      }

      function getCalendarPath(msg) {
        return msg.calendarSourcePath ? msg.calendarSourcePath : msg.calendarPath;
      }

      function _onCalendarCreated(type, msg) {
        $log.debug('Received a new calendar', type, msg);
        var calendarPath = calPathParser.parseCalendarPath(getCalendarPath(msg));

        calendarService.getCalendar(calendarPath.calendarHomeId, calendarPath.calendarId, true).then(function(calendarCollectionShell) {
          if (calendarCollectionShell) {
            calendarService.addAndEmit(calendarPath.calendarHomeId, calendarCollectionShell);
          }

        }).catch(function(err) {
          $log.error('Can not get the new calendar', err);
        });
      }

      function _onCalendarDeleted(type, msg) {
        $log.debug('Calendar deleted', type, msg);
        var calendarPath = calPathParser.parseCalendarPath(getCalendarPath(msg));

        calendarService.removeAndEmit(calendarPath.calendarHomeId, {id: calendarPath.calendarId});
      }

      function _onCalendarUpdated(type, msg) {
        $log.debug('Calendar updated', type, msg);
        var calendarPath = calPathParser.parseCalendarPath(getCalendarPath(msg));

        calendarService.getCalendar(calendarPath.calendarHomeId, calendarPath.calendarId, true).then(function(calendarCollectionShell) {
          if (calendarCollectionShell) {
            calendarService.updateAndEmit(calendarPath.calendarHomeId, calendarCollectionShell);
          }

        }).catch(function(err) {
          $log.error('Can not get the updated calendar', err);
        });
      }

      function _onEventCreateRequestOrUpdate(type, msg) {
        $log.debug('Calendar Event created/updated', type, msg);
        var event = CalendarShell.from(msg.event, {etag: msg.etag, path: getEventPath(msg)});

        calendarService.getCalendar(event.calendarHomeId, event.calendarId).then(function(calendar) {
          if (!calUIAuthorizationService.canModifyEvent(calendar, event, session.user._id)) {
            event.editable = false;
          }

          _udpateEventCacheAndNotify(event);
        });
      }

      function _onEventReply(type, msg) {
        $log.debug('Calendar Event reply', type, msg);
        var event = CalendarShell.from(msg.event, {etag: msg.etag, path: msg.eventPath});

        _udpateEventCacheAndNotify(event);
      }

      function _onEventDeleted(type, msg) {
        $log.debug('Calendar Event deleted/canceled', type, msg);
        var event = CalendarShell.from(msg.event, {etag: msg.etag, path: getEventPath(msg)});

        _removeFromEventCacheAndNotify(event);
      }

      function _onEventCancelled(type, msg) {
        $log.debug('Calendar Event deleted/canceled', type, msg);
        var event = CalendarShell.from(msg.event, {etag: msg.etag, path: getEventPath(msg)});

        //If instances of reccurring event have been cancelled but not the whole event
        // Then event is not cancelled but modified
        if (event.status !== CAL_ICAL.status.CANCELLED) {
          _udpateEventCacheAndNotify(event);
        } else {
          _removeFromEventCacheAndNotify(event);
        }
      }

      function _udpateEventCacheAndNotify(event) {
        calCachedEventSource.registerUpdate(event);
        calMasterEventCache.save(event);
        calendarEventEmitter.emitModifiedEvent(event);
      }

      function _removeFromEventCacheAndNotify(event) {
        calCachedEventSource.registerDelete(event);
        calMasterEventCache.remove(event);
        calendarEventEmitter.emitRemovedEvent(event);
      }
    }
  }
})();
