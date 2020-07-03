'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calWebsocketListenerService service', function() {
  var $rootScope, $q, $log, scope, liveNotification, calWebsocketListenerService, CAL_ICAL, CAL_WEBSOCKET;
  var CalendarShellMock, calEventServiceMock, calendarServiceMock, calendarEventEmitterMock, calMasterEventCacheMock, calCachedEventSourceMock, CalendarMock, calUIAuthorizationServiceMock;
  var calendarHomeId, calendarId, calendarPath, calendarSourceHomeId, calendarSourceId, calendarSourcePath, canModifyMock;

  beforeEach(function() {
    var liveNotificationMock = function(namespace) {
      if (liveNotification) {
        return liveNotification(namespace);
      }

      return {
        on: function() {},
        removeListener: function() {}
      };
    };

    CalendarMock = {
      rights: {
        getShareeRight: sinon.spy(),
        getPublicRight: sinon.spy()
      },
      isOwner: sinon.spy()
    };

    calUIAuthorizationServiceMock = {
      canModifyEvent: function() {
        return canModifyMock;
      }
    };

    calendarServiceMock = {
      getCalendar: function() {
        return $q.when(CalendarMock);
      }
    };
    calendarId = 'calendarId';
    calendarHomeId = 'calendarHomeId';
    calendarPath = calendarHomeId + '/' + calendarId + '.json';

    calendarSourceId = 'calendarSourceId';
    calendarSourceHomeId = 'calendarSourceHomeId';
    calendarSourcePath = calendarSourceHomeId + '/' + calendarSourceId + '.json';

    CalendarShellMock = function() {
      return self.CalendarShellConstMock.apply(this, arguments);
    };

    CalendarShellMock.from = sinon.spy(function(event, extendedProp) {
      return angular.extend({}, event, extendedProp);
    });

    CalendarShellMock.fromIncompleteShell = sinon.spy();

    calendarEventEmitterMock = {
      emitModifiedEvent: sinon.spy(),
      emitRemovedEvent: sinon.spy()
    };

    calMasterEventCacheMock = {
      save: sinon.spy(),
      get: sinon.spy(),
      remove: sinon.spy()
    };

    calCachedEventSourceMock = {
      wrapEventSource: sinon.spy(function(id, eventSource) {
        return eventSource;
      }),
      resetCache: sinon.spy(),
      registerUpdate: sinon.spy(),
      registerDelete: sinon.spy()
    };

    calEventServiceMock = {
      createEvent: function() {
        return $q.when({});
      },
      modifyEvent: sinon.spy(function() {
        return $q.when();
      })
    };

    angular.mock.module('esn.calendar');
    angular.mock.module(function($provide) {
      $provide.value('livenotification', liveNotificationMock);
      $provide.value('CalendarShell', CalendarShellMock);
      $provide.value('calendarEventEmitter', calendarEventEmitterMock);
      $provide.value('calMasterEventCache', calMasterEventCacheMock);
      $provide.value('calCachedEventSource', calCachedEventSourceMock);
      $provide.value('calEventService', calEventServiceMock);
      $provide.value('calendarService', calendarServiceMock);
      $provide.value('calUIAuthorizationService', calUIAuthorizationServiceMock);
      $provide.value('Cache', function() {});
    });
  });

  beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, _$q_, _$log_, _calWebsocketListenerService_, _CAL_ICAL_, _CAL_WEBSOCKET_) {
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    $q = _$q_;
    $log = _$log_;
    calWebsocketListenerService = _calWebsocketListenerService_;
    CAL_WEBSOCKET = _CAL_WEBSOCKET_;
    CAL_ICAL = _CAL_ICAL_;
  }));

  afterEach(function() {
    liveNotification = null;
  });

  describe('The listenEvents function', function() {
    var listener, wsEventCreateListener, wsEventModifyListener, wsEventDeleteListener, wsEventRequestListener, wsEventReplyListener, wsEventCancelListener, testUpdateCalCachedEventSourceAndFcEmit, testUpdateCalMasterEventCache, wsSubscriptionCreatedListener, wsSubscriptionUpdatedListener, wsSubscriptionDeletedListener;

    beforeEach(function() {
      liveNotification = function(namespace) {
        expect(namespace).to.equal(CAL_WEBSOCKET.NAMESPACE);

        return {
          removeListener: sinon.spy(),
          on: function(event, handler) {
            switch (event) {
              case CAL_WEBSOCKET.EVENT.CREATED:
                wsEventCreateListener = handler;
                break;
              case CAL_WEBSOCKET.EVENT.UPDATED:
                wsEventModifyListener = handler;
                break;
              case CAL_WEBSOCKET.EVENT.DELETED:
                wsEventDeleteListener = handler;
                break;
              case CAL_WEBSOCKET.EVENT.REQUEST:
                wsEventRequestListener = handler;
                break;
              case CAL_WEBSOCKET.EVENT.REPLY:
                wsEventReplyListener = handler;
                break;
              case CAL_WEBSOCKET.EVENT.CANCEL:
                wsEventCancelListener = handler;
                break;
              case CAL_WEBSOCKET.SUBSCRIPTION.CREATED:
                wsSubscriptionCreatedListener = handler;
                break;
              case CAL_WEBSOCKET.SUBSCRIPTION.UPDATED:
                wsSubscriptionUpdatedListener = handler;
                break;
              case CAL_WEBSOCKET.SUBSCRIPTION.DELETED:
                wsSubscriptionDeletedListener = handler;
                break;
              }
          }
        };
      };

      testUpdateCalCachedEventSourceAndFcEmit = function(wsCallback, expectedCacheMethod, expectedEmitMethod, eventSourcePath) {
        canModifyMock = true;
        var event = {id: 'id', calendarId: 'calId'};
        var path = eventSourcePath || 'path';
        var etag = 'etag';
        var resultingEvent = CalendarShellMock.from(event, {etag: etag, path: path});

        wsCallback({event: event, eventPath: path, eventSourcePath: eventSourcePath, etag: etag});
        scope.$digest();

        expect(CalendarShellMock.from).to.have.been.calledWith(event, {path: path, etag: etag});
        expect(calendarEventEmitterMock[expectedEmitMethod]).to.have.been.calledWith(resultingEvent);
        expect(calCachedEventSourceMock[expectedCacheMethod]).to.have.been.calledWith(resultingEvent);
      };

      testUpdateCalMasterEventCache = function(wsCallback, expectedCacheMethod) {
        canModifyMock = false;
        var event = {id: 'id', calendarId: 'calId', editable: false};
        var path = 'path';
        var etag = 'etag';
        var resultingEvent = CalendarShellMock.from(event, {etag: etag, path: path, editable: false});

        wsCallback({event: event, eventPath: path, etag: etag});
        scope.$digest();

        expect(CalendarShellMock.from).to.have.been.calledWith(event, {path: path, etag: etag});
        expect(calMasterEventCacheMock[expectedCacheMethod]).to.have.been.calledWith(resultingEvent);
      };

      listener = calWebsocketListenerService.listenEvents();
    });

    it('should return a valid hash', function() {
      expect(listener.sio).to.exist;
    });

    describe('on EVENT.CREATED event', function() {
      it('should update event on calCachedEventSource and emit an event for a modification', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventCreateListener, 'registerUpdate', 'emitModifiedEvent');
      });

      it('should consider eventSourcePath', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventCreateListener, 'registerUpdate', 'emitModifiedEvent', 'eventSourcePath');
      });

      it('should update event on calMasterEventCache or a modification', function() {
        testUpdateCalMasterEventCache(wsEventCreateListener, 'save');
      });
    });

    describe('on EVENT.REQUEST event', function() {
      it('should update event on calCachedEventSource and broadcast emit an event for a modification', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventRequestListener, 'registerUpdate', 'emitModifiedEvent');
      });

      it('should consider eventSourcePath', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventRequestListener, 'registerUpdate', 'emitModifiedEvent', 'eventSourcePath');
      });

      it('should update event on calMasterEventCache for a modification', function() {
        testUpdateCalMasterEventCache(wsEventRequestListener, 'save');
      });
    });

    describe('on EVENT.UPDATED event', function() {
      it('should update event on calCachedEventSource and broadcast emit an event for a modification', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventModifyListener, 'registerUpdate', 'emitModifiedEvent');
      });

      it('should consider eventSourcePath', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventModifyListener, 'registerUpdate', 'emitModifiedEvent', 'eventSourcePath');
      });

      it('should update event on calMasterEventCache for a modification', function() {
        testUpdateCalMasterEventCache(wsEventModifyListener, 'save');
      });
    });

    describe('on EVENT.DELETED', function() {
      it('should remove event on calCachedEventSource and broadcast emit an event for a deletion', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventDeleteListener, 'registerDelete', 'emitRemovedEvent');
      });

      it('should consider eventSourcePath', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventDeleteListener, 'registerDelete', 'emitRemovedEvent', 'eventSourcePath');
      });

      it('should remove event on calMasterEventCache for a deletion', function() {
        testUpdateCalMasterEventCache(wsEventDeleteListener, 'remove');
      });
    });

    describe('on EVENT.CANCEL', function() {
      it('should remove event on calCachedEventSource and broadcast emit an event for a deletion if whole event is cancelled', function() {
        var event = {id: 'id', calendarId: 'calId', status: CAL_ICAL.status.CANCELLED};
        var path = 'path';
        var etag = 'etag';
        var resultingEvent = CalendarShellMock.from(event, {etag: etag, path: path});

        wsEventCancelListener({event: event, eventPath: path, etag: etag});
        scope.$digest();

        expect(CalendarShellMock.from).to.have.been.calledWith(event, {path: path, etag: etag});
        expect(calendarEventEmitterMock.emitRemovedEvent).to.have.been.calledWith(resultingEvent);
        expect(calCachedEventSourceMock.registerDelete).to.have.been.calledWith(resultingEvent);
      });

      it('should remove event on calMasterEventCache for a deletion if whole event is cancelled', function() {
        var event = {id: 'id', calendarId: 'calId', status: CAL_ICAL.status.CANCELLED};
        var path = 'path';
        var etag = 'etag';
        var resultingEvent = CalendarShellMock.from(event, {etag: etag, path: path});

        wsEventCancelListener({event: event, eventPath: path, etag: etag});
        scope.$digest();

        expect(CalendarShellMock.from).to.have.been.calledWith(event, {path: path, etag: etag});
        expect(calMasterEventCacheMock.remove).to.have.been.calledWith(resultingEvent);
      });
      it('should update event on calCachedEventSource and broadcast emit an event for a modification if master event is not cancelled', function() {
        var event = {id: 'id', calendarId: 'calId'};
        var path = 'path';
        var etag = 'etag';
        var resultingEvent = CalendarShellMock.from(event, {etag: etag, path: path, editable: false});

        wsEventModifyListener({event: event, eventPath: path, etag: etag});
        scope.$digest();

        expect(CalendarShellMock.from).to.have.been.calledWith(event, {path: path, etag: etag});
        expect(calendarEventEmitterMock.emitModifiedEvent).to.have.been.calledWith(resultingEvent);
        expect(calCachedEventSourceMock.registerUpdate).to.have.been.calledWith(resultingEvent);
      });

      it('should update event on calMasterEventCache for a modification if master event is not cancelled', function() {
        var event = {id: 'id', calendarId: 'calId'};
        var path = 'path';
        var etag = 'etag';
        var resultingEvent = CalendarShellMock.from(event, {etag: etag, path: path, editable: false});

        wsEventModifyListener({event: event, eventPath: path, etag: etag});
        scope.$digest();

        expect(CalendarShellMock.from).to.have.been.calledWith(event, {path: path, etag: etag});
        expect(calMasterEventCacheMock.save).to.have.been.calledWith(resultingEvent);
      });
    });

    describe('on EVENT.REPLY event', function() {
      it('should update event on calCachedEventSource and broadcast emit an event for a modification', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventReplyListener, 'registerUpdate', 'emitModifiedEvent');
      });

      it('should consider eventSourcePath', function() {
        testUpdateCalCachedEventSourceAndFcEmit(wsEventReplyListener, 'registerUpdate', 'emitModifiedEvent', 'eventSourcePath');
      });

      it('should update event on calMasterEventCache for a modification', function() {
        testUpdateCalMasterEventCache(wsEventReplyListener, 'save');
      });
    });

    describe('on SUBSCRIPTION.CREATED event', function() {
      it('should fetch and add calendar', function() {
        var calendarCollectionShell = {_id: 1};

        calendarServiceMock.getCalendar = sinon.spy(function() {
          return $q.when(calendarCollectionShell);
        });
        calendarServiceMock.addAndEmit = sinon.spy();

        wsSubscriptionCreatedListener({calendarPath: calendarPath});
        scope.$digest();

        expect(calendarServiceMock.getCalendar).to.have.been.calledWith(calendarHomeId, calendarId);
        expect(calendarServiceMock.addAndEmit).to.have.been.calledWith(calendarHomeId, calendarCollectionShell);
      });

      it('should fetch and add calendar using the source path when defined', function() {
        var calendarCollectionShell = {_id: 1};

        calendarServiceMock.getCalendar = sinon.spy(function() {
          return $q.when(calendarCollectionShell);
        });
        calendarServiceMock.addAndEmit = sinon.spy();

        wsSubscriptionCreatedListener({calendarPath: calendarPath, calendarSourcePath: calendarSourcePath});
        scope.$digest();

        expect(calendarServiceMock.getCalendar).to.have.been.calledWith(calendarSourceHomeId, calendarSourceId);
        expect(calendarServiceMock.addAndEmit).to.have.been.calledWith(calendarSourceHomeId, calendarCollectionShell);
      });

      it('should not add calendar when not found', function() {
        calendarServiceMock.getCalendar = sinon.spy(function() {
          return $q.when();
        });
        calendarServiceMock.addAndEmit = sinon.spy();

        wsSubscriptionCreatedListener({calendarPath: calendarPath});
        scope.$digest();

        expect(calendarServiceMock.getCalendar).to.have.been.calledWith(calendarHomeId, calendarId);
        expect(calendarServiceMock.addAndEmit).to.not.have.been.called;
      });

      it('should log error when calendarService.getCalendar fails', function() {
        var error = new Error('I failed to get the calendar');
        var errorSpy = sinon.spy($log, 'error');

        calendarServiceMock.getCalendar = sinon.spy(function() {
          return $q.reject(error);
        });
        calendarServiceMock.addAndEmit = sinon.spy();

        wsSubscriptionCreatedListener({calendarPath: calendarPath});
        scope.$digest();

        expect(calendarServiceMock.getCalendar).to.have.been.calledWith(calendarHomeId, calendarId);
        expect(calendarServiceMock.addAndEmit).to.not.have.been.called;
        expect(errorSpy).to.have.been.calledWith('Can not get the new calendar', error);
      });
    });

    describe('on SUBSCRIPTION.UPDATED event', function() {
      it('should fetch and update calendar', function() {
        var calendarCollectionShell = {_id: 1};

        calendarServiceMock.getCalendar = sinon.spy(function() {
          return $q.when(calendarCollectionShell);
        });
        calendarServiceMock.updateAndEmit = sinon.spy();

        wsSubscriptionUpdatedListener({calendarPath: calendarPath});
        scope.$digest();

        expect(calendarServiceMock.getCalendar).to.have.been.calledWith(calendarHomeId, calendarId);
        expect(calendarServiceMock.updateAndEmit).to.have.been.calledWith(calendarHomeId, calendarCollectionShell);
      });

      it('should fetch and update calendar using the source path when defined', function() {
        var calendarCollectionShell = {_id: 1};

        calendarServiceMock.getCalendar = sinon.spy(function() {
          return $q.when(calendarCollectionShell);
        });
        calendarServiceMock.updateAndEmit = sinon.spy();

        wsSubscriptionUpdatedListener({calendarPath: calendarPath, calendarSourcePath: calendarSourcePath});
        scope.$digest();

        expect(calendarServiceMock.getCalendar).to.have.been.calledWith(calendarSourceHomeId, calendarSourceId);
        expect(calendarServiceMock.updateAndEmit).to.have.been.calledWith(calendarSourceHomeId, calendarCollectionShell);
      });

      it('should not add calendar when not found', function() {
        calendarServiceMock.getCalendar = sinon.spy(function() {
          return $q.when();
        });
        calendarServiceMock.updateAndEmit = sinon.spy();

        wsSubscriptionCreatedListener({calendarPath: calendarPath});
        scope.$digest();

        expect(calendarServiceMock.getCalendar).to.have.been.calledWith(calendarHomeId, calendarId);
        expect(calendarServiceMock.updateAndEmit).to.not.have.been.called;
      });

      it('should log error when calendarService.getCalendar fails', function() {
        var error = new Error('I failed to get the calendar');
        var errorSpy = sinon.spy($log, 'error');

        calendarServiceMock.getCalendar = sinon.spy(function() {
          return $q.reject(error);
        });
        calendarServiceMock.updateAndEmit = sinon.spy();

        wsSubscriptionUpdatedListener({calendarPath: calendarPath});
        scope.$digest();

        expect(calendarServiceMock.getCalendar).to.have.been.calledWith(calendarHomeId, calendarId);
        expect(calendarServiceMock.updateAndEmit).to.not.have.been.called;
        expect(errorSpy).to.have.been.calledWith('Can not get the updated calendar', error);
      });
    });

    describe('on SUBSCRIPTION.DELETED event', function() {
      it('should call calendarService.removeAndEmit', function() {
        calendarServiceMock.removeAndEmit = sinon.spy();
        wsSubscriptionDeletedListener({calendarPath: calendarPath});
        scope.$digest();

        expect(calendarServiceMock.removeAndEmit).to.have.been.calledWith(calendarHomeId, {id: calendarId});
      });

      it('should call calendarService.removeAndEmit using the source path when defined', function() {
        calendarServiceMock.removeAndEmit = sinon.spy();
        wsSubscriptionDeletedListener({calendarPath: calendarPath, calendarSourcePath: calendarSourcePath});
        scope.$digest();

        expect(calendarServiceMock.removeAndEmit).to.have.been.calledWith(calendarSourceHomeId, {id: calendarSourceId});
      });
    });
  });
});
