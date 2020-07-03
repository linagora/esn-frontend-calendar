'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The CalCalendarImportController', function() {

  var $controller, $rootScope, $scope;
  var calendarService, calendarHomeService, davImportService, session;

  beforeEach(module(function($provide) {
    $provide.value('asyncAction', sinon.spy(function(message, action) {
      return action();
    }));
    $provide.value('davImportService', sinon.spy(function() {
      return {
        importFromFile: sinon.spy()
      };
    }));
  }));

  beforeEach(function() {
    module('esn.calendar');

    inject(function(
      _$controller_,
      _$rootScope_,
      _calendarService_,
      _calendarHomeService_,
      _davImportService_,
      _session_
    ) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      calendarService = _calendarService_;
      calendarHomeService = _calendarHomeService_;
      davImportService = _davImportService_;
      session = _session_;
    });
  });

  function initController(scope) {
    $scope = scope || $rootScope.$new();

    var controller = $controller('CalCalendarImportController', {
      $scope: $scope
    });

    $scope.$digest();

    return controller;
  }

  it('should get a list configurations from server on init', function() {
    session.user._id = '123';

    var calendars = [{
        id: 'calendar1'
      },
      {
        id: 'calendar2'
      }
    ];

    sinon.stub(calendarService, 'listPersonalAndAcceptedDelegationCalendars', function() {
      return $q.when(calendars);
    });

    sinon.stub(calendarHomeService, 'getUserCalendarHomeId', function() {
      return $q.when(session.user._id);
    });

    var controller = initController();

    controller.$onInit();
    $rootScope.$digest();

    expect(controller.calendars).to.deep.equal(calendars);
    expect(controller.calendar).to.deep.equal(calendars[0]);
  });

  describe('The onFileSelect function', function() {
    it('should return true if the file type is text/calendar on file select', function() {
      var file = [{
        type: 'text/calendar'
      }];

      var controller = initController();

      controller.onFileSelect(file);
      $rootScope.$digest();

      expect(controller.file).to.deep.equal(file[0]);
      expect(controller.isValid).to.be.true;
    });

    it('should return false if the file type is not text/calendar on file select', function() {
      var file = [{
        type: 'text/xml'
      }];

      var controller = initController();

      controller.onFileSelect(file);
      $rootScope.$digest();

      expect(controller.file).to.deep.equal(file[0]);
      expect(controller.isValid).to.be.false;
    });

    it('should return a file is not selected of don\t have any length on file select', function() {
      var file = [];

      var controller = initController();

      controller.onFileSelect(file);
      $rootScope.$digest();

      expect(controller.file).to.equal(null);
      expect(controller.isValid).to.be.falsy;
    });
  });

  describe('The canModifyCalendar function', function() {
    it('should return true if the user is owner of the calendar', function() {
      session.user._id = '123';

      var calendar = {
        isOwner: sinon.stub().returns(true),
        isReadable: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(false),
        isPublic: sinon.stub().returns(false)
      };

      var controller = initController();

      var res = controller.canModifyCalendar(calendar);
      $rootScope.$digest();

      expect(res).to.be.true;
    });

    it('should return false if the user is not the owner of the calendar', function() {
      session.user._id = '123';

      var calendar = {
        isOwner: sinon.stub().returns(false),
        isReadable: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(false),
        isPublic: sinon.stub().returns(false)
      };

      var controller = initController();

      var res = controller.canModifyCalendar(calendar);
      $rootScope.$digest();

      expect(res).to.be.false;
    });

    it('should return false if the user is not the owner of the calendar and the calendar is public', function() {
      session.user._id = '123';

      var calendar = {
        isOwner: sinon.stub().returns(false),
        isReadable: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(false),
        isPublic: sinon.stub().returns(true)
      };

      var controller = initController();

      var res = controller.canModifyCalendar(calendar);
      $rootScope.$digest();

      expect(res).to.be.false;
    });
  });

  describe('The submit function', function() {
    it('should call davImportService.importFromFile with selected file and selected calendar', function() {
      session.user._id = '123';

      var calendars = [{
          id: 'calendar1'
        },
        {
          id: 'calendar2'
        }
      ];

      sinon.stub(calendarService, 'listPersonalAndAcceptedDelegationCalendars', function() {
        return $q.when(calendars);
      });

      sinon.stub(calendarHomeService, 'getUserCalendarHomeId', function() {
        return $q.when(session.user._id);
      });

      calendarService.listPersonalAndAcceptedDelegationCalendars = sinon.stub().returns($q.when(calendars));

      var controller = initController();
      var file = [{
        type: 'text/calendar',
        length: 100
      }];

      davImportService.importFromFile = sinon.stub().returns($q.when());

      controller.onFileSelect(file);
      controller.submit();
      $rootScope.$digest();

      expect(davImportService.importFromFile).to.have.been.calledWith(controller.file, calendars[0].href);
    });
  });
});
