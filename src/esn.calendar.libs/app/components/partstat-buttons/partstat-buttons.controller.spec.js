'use strict';

/* global chai: false, sinon: false, __FIXTURES__: false */

const { expect } = chai;

describe('The CalPartstatButtonsController', function() {
  let $rootScope, $controller, $q, calEventService, session, CalendarShell, esnDatetimeService, ICAL;
  const shells = {};
  let fileSaveMock;
  let scope;

  function initCtrl() {
    scope = $rootScope.$new();

    return $controller('CalPartstatButtonsController', { $rootScope, $scope: scope }, {});
  }

  beforeEach(function() {
    fileSaveMock = {
      saveAs: sinon.spy()
    };

    angular.mock.module('esn.resource.libs');
    angular.mock.module('esn.calendar.libs');
    angular.mock.module(function($provide) {
      $provide.value('$attrs', {});
      $provide.value('calEventService', {
        changeParticipation: sinon.spy(function() {
          return $q.when(new CalendarShell(shells.recurringEventWithTwoExceptions.vcalendar, { etag: 'updatedEtag' }));
        }),
        getEventByUID: function() {
          return $q.when(shells.event);
        }
      });
      $provide.value('FileSaver', fileSaveMock);
    });
  });

  beforeEach(inject(function(_$rootScope_, _$controller_, _$q_, _CalendarShell_, _calEventService_, _session_, _esnDatetimeService_, _ICAL_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $q = _$q_;
    CalendarShell = _CalendarShell_;
    calEventService = _calEventService_;
    session = _session_;
    ICAL = _ICAL_;
    esnDatetimeService = _esnDatetimeService_;
    esnDatetimeService.getTimeZone = function() {
      return 'Europe/Paris';
    };
  }));

  beforeEach(function() {
    ['event', 'recurringEventWithTwoExceptions'].forEach(function(file) {
      shells[file] = new CalendarShell(ICAL.Component.fromString(__FIXTURES__[('src/linagora.esn.calendar/app/fixtures/calendar/' + file + '.ics')]), {
        etag: 'etag',
        path: 'path'
      });
    });
  });

  describe('The changeParticipation method', function() {
    it('should call calEventService.changeParticipation with the correct options and partstat', function() {
      var ctrl = initCtrl();

      session.user.emails = ['admin@linagora.com'];
      ctrl.event = shells.recurringEventWithTwoExceptions;

      ctrl.changeParticipation('DECLINED');

      expect(calEventService.changeParticipation).to.have.been.calledWith('path', sinon.match.any, ['admin@linagora.com'], 'DECLINED', 'etag');
    });

    it('should not call calEventService.changeParticipation if partstat is already correct', function() {
      var ctrl = initCtrl();

      session.user.emails = ['admin@linagora.com'];
      ctrl.event = shells.recurringEventWithTwoExceptions;
      ctrl.event.changeParticipation('ACCEPTED', ['admin@linagora.com']);

      ctrl.changeParticipation('ACCEPTED');

      expect(calEventService.changeParticipation).to.have.not.been.called;
    });

    it('should not call calEventService.changeParticipation if user is not attendee', function() {
      var ctrl = initCtrl();

      session.user.emails = ['notattendee@linagora.com'];
      ctrl.event = shells.recurringEventWithTwoExceptions;

      ctrl.changeParticipation('ACCEPTED');

      expect(calEventService.changeParticipation).to.have.not.been.called;
    });
  });
});
