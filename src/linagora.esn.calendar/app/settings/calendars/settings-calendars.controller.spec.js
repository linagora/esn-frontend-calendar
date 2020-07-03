'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The CalSettingsCalendarsController controller', function() {
  var $rootScope, $controller, $scope, $log, session, calendarService, calendarHomeService, calendar, otherCalendar, calendars, userAndExternalCalendars, calCalendarDeleteConfirmationModalService;
  var CAL_EVENTS, CalSettingsCalendarsController;

  beforeEach(function() {
    session = {
      ready: {then: function() {}},
      user: {
        _id: 1
      }
    };
    calendarService = {};
    calCalendarDeleteConfirmationModalService = sinon.spy();
    calendar = {
      uniqueId: 1,
      calendarHomeId: 'MyId',
      name: 'MyName',
      getUniqueId: function() {
        return 1;
      }
    };
    calendarHomeService = {
      getUserCalendarHomeId: function() {
        return $q.when(session.user._id);
      }
    };
    otherCalendar = {
      uniqueId: 2,
      calendarHomeId: 'MyOtherId',
      name: 'MyOtherName',
      getUniqueId: function() {
        return 2;
      }
    };
    calendars = [calendar, otherCalendar];
    userAndExternalCalendars = sinon.spy(function() {
      return {
        userCalendars: calendars
      };
    });
  });

  beforeEach(function() {
    angular.mock.module('esn.calendar', function($provide) {
      $provide.value('session', session);
      $provide.value('calendarHomeService', calendarHomeService);
      $provide.value('calendarService', calendarService);
      $provide.value('userAndExternalCalendars', userAndExternalCalendars);
      $provide.value('calCalendarDeleteConfirmationModalService', calCalendarDeleteConfirmationModalService);
    });
  });

  beforeEach(function() {
    angular.mock.inject(function(_$rootScope_, _$controller_, _$log_, _CAL_EVENTS_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $log = _$log_;
      $scope = $rootScope.$new();
      CAL_EVENTS = _CAL_EVENTS_;
    });
  });

  beforeEach(function() {
    calendarService.listPersonalAndAcceptedDelegationCalendars = sinon.spy(function() {
      return $q.when(calendars);
    });

    CalSettingsCalendarsController = initController();
  });

  function initController() {
    return $controller('CalSettingsCalendarsController', { $scope: $scope });
  }

  describe('The $onInit function', function() {
    it('should get the calendars from the calendarService', function() {
      var calendars = [calendar, otherCalendar];

      CalSettingsCalendarsController.$onInit();
      $rootScope.$digest();

      expect(calendarService.listPersonalAndAcceptedDelegationCalendars).to.have.been.calledWith(session.user._id);
      expect(CalSettingsCalendarsController.calendars).to.deep.equal(calendars);
    });
  });

  describe('Calendar listeners', function() {
    describe('CAL_EVENTS.CALENDARS.ADD listener', function() {
      it('should add calendar to self.calendars if it does not exist yet', function() {
        var newCalendar = {
          uniqueId: 3,
          calendarHomeId: 'NewId',
          name: 'NewName'
        };
        var expectedResult = calendars.concat(newCalendar);

        CalSettingsCalendarsController.$onInit();
        $rootScope.$digest();
        $rootScope.$broadcast(CAL_EVENTS.CALENDARS.ADD, newCalendar);

        expect(CalSettingsCalendarsController.calendars).to.deep.equal(expectedResult);
      });

      it('should not add calendar to self.calendars if it already exists', function() {
        var newCalendar = {
          uniqueId: 1,
          calendarHomeId: 'MyId',
          name: 'MyName'
        };

        CalSettingsCalendarsController.$onInit();
        $rootScope.$digest();
        $rootScope.$broadcast(CAL_EVENTS.CALENDARS.ADD, newCalendar);

        expect(CalSettingsCalendarsController.calendars).to.deep.equal(calendars);
      });
    });

    describe('CAL_EVENTS.CALENDARS.REMOVE listener', function() {
      it('should remove calendar from self.calendars', function() {
        var expectedResult = calendars.slice(1);

        CalSettingsCalendarsController.$onInit();
        $rootScope.$digest();
        $rootScope.$broadcast(CAL_EVENTS.CALENDARS.REMOVE, calendars[0]);

        expect(CalSettingsCalendarsController.calendars).to.deep.equal(expectedResult);
      });

      it('should not remove non existing calendar from self.calendars', function() {
        var expectedResult = calendars;
        var newCalendar = {
          uniqueId: 3,
          calendarHomeId: 'NewId',
          name: 'NewName'
        };

        CalSettingsCalendarsController.$onInit();
        $rootScope.$digest();
        $rootScope.$broadcast(CAL_EVENTS.CALENDARS.REMOVE, newCalendar);

        expect(CalSettingsCalendarsController.calendars).to.deep.equal(expectedResult);
      });

    });

    describe('CAL_EVENTS.CALENDARS.UPDATE listener', function() {
      it('should update calendar in self.calendars if existed', function() {
        var newCalendar = {
          uniqueId: 1,
          calendarHomeId: 'UpdatedID',
          name: 'UpdatedName'
        };
        var expectedResult = [newCalendar].concat(calendars.slice(1));

        CalSettingsCalendarsController.$onInit();
        $rootScope.$digest();
        $rootScope.$broadcast(CAL_EVENTS.CALENDARS.UPDATE, newCalendar);

        expect(CalSettingsCalendarsController.calendars).to.deep.equal(expectedResult);
        expect(CalSettingsCalendarsController.calendars[0].name).to.equal(newCalendar.name);
        expect(CalSettingsCalendarsController.calendars[0].calendarHomeId).to.equal(newCalendar.calendarHomeId);
      });

      it('should do nothing if the updated calendar does not exist in self.calendars', function() {
        var newCalendar = {
          uniqueId: 3,
          calendarHomeId: 'NewId',
          name: 'NewName'
        };
        var expectedResult = calendars;

        CalSettingsCalendarsController.$onInit();
        $rootScope.$digest();
        $rootScope.$broadcast(CAL_EVENTS.CALENDARS.UPDATE, newCalendar);

        expect(CalSettingsCalendarsController.calendars).to.deep.equal(expectedResult);
      });
    });

  });

  describe('The remove function', function() {
    it('should show the confirmation dialog', function() {
      CalSettingsCalendarsController.calendars = [];
      CalSettingsCalendarsController.remove(calendar);

      expect(calCalendarDeleteConfirmationModalService).to.have.been.calledOnce;
    });

    it('should remove the calendar', function() {
      calendarService.removeCalendar = sinon.spy(function() {
        return $q.when();
      });
      CalSettingsCalendarsController.calendars = [calendar, otherCalendar];
      CalSettingsCalendarsController.remove(calendar);

      var removeCalendar = calCalendarDeleteConfirmationModalService.firstCall.args[1];

      removeCalendar();
      $rootScope.$digest();

      expect(calendarService.removeCalendar).to.have.been.calledWith(calendar.calendarHomeId, calendar);
      expect(CalSettingsCalendarsController.calendars).to.deep.equals([otherCalendar]);
    });

    it('should not remove calendar is calendarService failed', function() {
      var logSpy = sinon.spy($log, 'error');
      var error = new Error('I failed...');

      calendarService.removeCalendar = sinon.spy(function() {
        return $q.reject(error);
      });
      CalSettingsCalendarsController.calendars = [calendar, otherCalendar];
      CalSettingsCalendarsController.remove(calendar);

      var removeCalendar = calCalendarDeleteConfirmationModalService.firstCall.args[1];

      removeCalendar();
      $rootScope.$digest();

      expect(calendarService.removeCalendar).to.have.been.calledWith(calendar.calendarHomeId, calendar);
      expect(CalSettingsCalendarsController.calendars.length).to.equals(2);
      expect(logSpy).to.have.been.calledOnce;
    });
  });
});
