'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calendar configuration tab delegation controller', function() {
  var $rootScope,
    $controller,
    $scope,
    $state,
    $q,
    calendarService,
    calUIAuthorizationService,
    CalCalendarRightsUtilsService,
    userUtils,
    session,
    CalendarConfigurationTabMainController,
    calCalendarDeleteConfirmationModalService,
    calCalDAVURLService,
    calFullUiConfiguration,
    CAL_CALENDAR_PUBLIC_RIGHT,
    CAL_CALENDAR_SHARED_RIGHT,
    calendar;

  function initController(bindings) {
    return $controller('CalendarConfigurationTabMainController', { $scope: $scope }, bindings);
  }

  beforeEach(function() {
    calendarService = {
      removeCalendar: sinon.spy(function() {
        return $q.when();
      }),
      unsubscribe: sinon.spy(function() {
        return $q.when();
      })
    };
    calFullUiConfiguration = {
      get: sinon.spy(function() {
        return $q.when();
      })
    };
    calendar = {
      isShared: sinon.stub().returns(false),
      isAdmin: sinon.stub().returns(false),
      isOwner: sinon.stub().returns(false),
      isPublic: sinon.stub().returns(false),
      isSubscription: sinon.stub().returns(false),
      isReadable: sinon.stub().returns(true),
      href: '/calendars/userid/id.json',
      type: 'user'
    };

    calCalendarDeleteConfirmationModalService = sinon.spy();

    calCalDAVURLService = {
      getCalendarURL: sinon.stub()
    };

    angular.mock.module('esn.calendar', function($provide) {
      $provide.value('calendarService', calendarService);
      $provide.value('calCalDAVURLService', calCalDAVURLService);
      $provide.value('calCalendarDeleteConfirmationModalService', calCalendarDeleteConfirmationModalService);
      $provide.value('calFullUiConfiguration', calFullUiConfiguration);
    });

    angular.mock.inject(function(_$rootScope_, _$controller_, _$state_, _$q_, _session_, _userUtils_, _CalCalendarRightsUtilsService_, _CAL_CALENDAR_PUBLIC_RIGHT_, _CAL_CALENDAR_SHARED_RIGHT_, _calUIAuthorizationService_) {
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $controller = _$controller_;
      $state = _$state_;
      $q = _$q_;
      userUtils = _userUtils_;
      session = _session_;
      calUIAuthorizationService = _calUIAuthorizationService_;
      CAL_CALENDAR_PUBLIC_RIGHT = _CAL_CALENDAR_PUBLIC_RIGHT_;
      CAL_CALENDAR_SHARED_RIGHT = _CAL_CALENDAR_SHARED_RIGHT_;
      CalCalendarRightsUtilsService = _CalCalendarRightsUtilsService_;
    });
  });

  beforeEach(function() {
    calCalDAVURLService.getCalendarURL.returns($q.when('http://localhost:8080'));
    CalendarConfigurationTabMainController = initController();
    sinon.spy($state, 'go');
  });

  describe('the $onInit', function() {
    it('should initialize self.publicRights with an array contains the different rights', function() {
      var publicRightsExpected = [
        {
          value: CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE,
          name: CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE_LABEL_LONG
        }, {
          value: CAL_CALENDAR_PUBLIC_RIGHT.READ,
          name: CAL_CALENDAR_PUBLIC_RIGHT.READ_LABEL_LONG
        }, {
          value: CAL_CALENDAR_PUBLIC_RIGHT.PRIVATE,
          name: CAL_CALENDAR_PUBLIC_RIGHT.PRIVATE_LABEL_LONG
        }
      ];

      CalendarConfigurationTabMainController.calendar = calendar;

      CalendarConfigurationTabMainController.$onInit();

      expect(CalendarConfigurationTabMainController.publicRights).to.deep.equal(publicRightsExpected);
    });
  });

  describe('the calendarIcsUrl', function() {
    beforeEach(function() {
      calendar = {
        isShared: sinon.stub().returns(false),
        isAdmin: sinon.stub().returns(false),
        isOwner: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(false),
        isReadable: sinon.stub().returns(true),
        id: 'id',
        calendarHomeId: 'homeId'
      };
    });

    it('should not be initialized if new calendar', function() {
      CalendarConfigurationTabMainController.calendar = calendar;
      CalendarConfigurationTabMainController.newCalendar = true;

      CalendarConfigurationTabMainController.$onInit();

      expect(CalendarConfigurationTabMainController.calendarIcsUrl).to.be.undefined;
    });

    it('should be initialized with calendar path if not subscription', function() {
      CalendarConfigurationTabMainController.calendar = calendar;

      CalendarConfigurationTabMainController.$onInit();

      expect(CalendarConfigurationTabMainController.calendarIcsUrl).to.equals('/dav/api/calendars/homeId/id?export');
    });

    it('should be initialized with calendar source path if subscription', function() {
      calendar = {
        isShared: sinon.stub().returns(false),
        isAdmin: sinon.stub().returns(false),
        isOwner: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(true),
        isReadable: sinon.stub().returns(true),
        id: 'id',
        calendarHomeId: 'homeId',
        source: {
          id: 'sourceId',
          calendarHomeId: 'sourceHomeId'
        }
      };

      CalendarConfigurationTabMainController.calendar = calendar;

      CalendarConfigurationTabMainController.$onInit();

      expect(CalendarConfigurationTabMainController.calendarIcsUrl).to.equals('/dav/api/calendars/sourceHomeId/sourceId?export');
    });
  });

  describe('the openDeleteConfirmationDialog function', function() {
    it('should call the modal confirmation service', function() {
      CalendarConfigurationTabMainController.openDeleteConfirmationDialog();

      expect(calCalendarDeleteConfirmationModalService).to.have.been.calledWith(CalendarConfigurationTabMainController.calendar, CalendarConfigurationTabMainController.removeCalendar);
    });
  });

  describe('the removeCalendar function', function() {
    it('should call calendarService.removeCalendar before $state to go back on the main view when deleting', function() {
      CalendarConfigurationTabMainController.calendar = {
        id: '123456789'
      };
      CalendarConfigurationTabMainController.calendarHomeId = '12345';

      CalendarConfigurationTabMainController.removeCalendar();

      expect($state.go).to.have.not.been.called;

      $rootScope.$digest();

      expect(calendarService.removeCalendar).to.have.been.calledWith(
        CalendarConfigurationTabMainController.calendarHomeId,
        CalendarConfigurationTabMainController.calendar
      );

      expect($state.go).to.have.been.calledWith('calendar.main');
    });
  });

  describe('the unsubscribe function', function() {
    it('should call calendarService.unsubscribe before $state to go back on the main view when unsubscribing', function() {
      CalendarConfigurationTabMainController.calendar = {
        id: '123456789'
      };
      CalendarConfigurationTabMainController.calendarHomeId = '12345';

      CalendarConfigurationTabMainController.unsubscribe();

      expect($state.go).to.have.not.been.called;

      $rootScope.$digest();

      expect(calendarService.unsubscribe).to.have.been.calledWith(
        CalendarConfigurationTabMainController.calendarHomeId,
        CalendarConfigurationTabMainController.calendar
      );

      expect($state.go).to.have.been.calledWith('calendar.main');
    });
  });

  describe('the canDeleteCalendar function', function() {
    var canDeleteCalendarResult;

    beforeEach(function() {
      CalendarConfigurationTabMainController.calendar = calendar;

      sinon.stub(calUIAuthorizationService, 'canDeleteCalendar', function() {
        return canDeleteCalendarResult;
      });
    });

    it('should return true if newCalendar=false and calUIAuthorizationService.canDeleteCalendar= true', function() {
      CalendarConfigurationTabMainController.newCalendar = false;
      canDeleteCalendarResult = true;

      CalendarConfigurationTabMainController.$onInit();

      expect(CalendarConfigurationTabMainController.canDeleteCalendar).to.be.true;
    });

    it('should return false if newCalendar=false and calUIAuthorizationService.canDeleteCalendar= false', function() {
      CalendarConfigurationTabMainController.newCalendar = false;
      canDeleteCalendarResult = false;

      CalendarConfigurationTabMainController.$onInit();

      expect(CalendarConfigurationTabMainController.canDeleteCalendar).to.be.false;
    });

    it('should return false if newCalendar=true', function() {
      CalendarConfigurationTabMainController.newCalendar = true;

      CalendarConfigurationTabMainController.$onInit();

      expect(CalendarConfigurationTabMainController.canDeleteCalendar).to.be.false;
    });
  });

  describe('the canExportIcs function', function() {
    it('should return false for new calendars', function() {
      sinon.spy(calUIAuthorizationService, 'canExportCalendarIcs');
      CalendarConfigurationTabMainController.newCalendar = true;
      CalendarConfigurationTabMainController.calendar = {
        type: 'user'
      };

      CalendarConfigurationTabMainController.$onInit();

      expect(calUIAuthorizationService.canExportCalendarIcs).to.not.have.been.called;
      expect(CalendarConfigurationTabMainController.canExportIcs).to.be.false;
    });

    it('should leverage calUIAuthorizationService.canExportCalendarIcs', function() {
      var canExportIcs = true;

      sinon.stub(calUIAuthorizationService, 'canExportCalendarIcs', function() {
        return canExportIcs;
      });
      sinon.stub(calUIAuthorizationService, 'canDeleteCalendar', function() {
        return true;
      });

      CalendarConfigurationTabMainController.calendar = {
        id: 'id',
        isAdmin: sinon.stub().returns(true),
        isShared: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(false),
        isReadable: sinon.stub().returns(true)
      };

      CalendarConfigurationTabMainController.$onInit();

      expect(calUIAuthorizationService.canExportCalendarIcs).to.have.been.calledWith(CalendarConfigurationTabMainController.calendar, session.user._id);
      expect(CalendarConfigurationTabMainController.canExportIcs).to.equal(canExportIcs);
    });
  });

  describe('the canModifyPublicSelection', function() {
    it('should return true for new calendars', function() {
      sinon.spy(calUIAuthorizationService, 'canModifyPublicSelection');
      CalendarConfigurationTabMainController.newCalendar = true;
      CalendarConfigurationTabMainController.calendar = {
        type: 'user'
      };

      CalendarConfigurationTabMainController.$onInit();

      expect(calUIAuthorizationService.canModifyPublicSelection).to.not.have.been.called;
      expect(CalendarConfigurationTabMainController.canModifyPublicSelection).to.be.true;
    });

    it('should leverage calUIAuthorizationService.canModifyPublicSelection', function() {
      var canModifyPublicSelection = true;

      sinon.stub(calUIAuthorizationService, 'canModifyPublicSelection', function() {
        return canModifyPublicSelection;
      });
      CalendarConfigurationTabMainController.calendar = {
        id: 'id',
        isShared: sinon.stub().returns(false),
        isOwner: sinon.stub().returns(false),
        isPublic: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(false),
        isReadable: sinon.stub().returns(true)
      };

      CalendarConfigurationTabMainController.$onInit();

      expect(calUIAuthorizationService.canModifyPublicSelection).to.have.been.calledWith(CalendarConfigurationTabMainController.calendar, session.user._id);
      expect(CalendarConfigurationTabMainController.canModifyPublicSelection).to.equal(canModifyPublicSelection);
    });
  });

  describe('the performExternalCalendarOperations', function() {
    var getShareeRightResult, getOwnerResult;

    beforeEach(function() {
      CalendarConfigurationTabMainController.calendar = {
        isShared: sinon.stub().returns(true)
      };

      getShareeRightResult = CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN;
      getOwnerResult = {
        preferredEmail: 'preferredEmail'
      };

      CalendarConfigurationTabMainController.calendar = {
        isAdmin: sinon.stub().returns(true),
        isShared: sinon.stub().returns(true),
        isSubscription: sinon.stub().returns(false),
        isReadable: sinon.stub().returns(true),
        rights: {
          getShareeRight: sinon.spy(function() {
            return getShareeRightResult;
          })
        },
        getOwner: sinon.spy(function() {
          return getOwnerResult;
        })
      };
    });

    it('should do nothing for a non external calendar "isShared=false and isSubscription=false"', function() {
      sinon.stub(calUIAuthorizationService, 'canModifyPublicSelection', angular.noop);
      CalendarConfigurationTabMainController.calendar.isShared = sinon.stub().returns(false);
      CalendarConfigurationTabMainController.calendar.isSubscription = sinon.stub().returns(false);

      CalendarConfigurationTabMainController.$onInit();

      $rootScope.$digest();

      expect(CalendarConfigurationTabMainController.calendar.rights.getShareeRight).to.not.have.been.called;
      expect(CalendarConfigurationTabMainController.calendar.getOwner).to.not.have.been.called;
    });

    it('should trigger performExternalCalendarOperations for an external calendar "isShared=true and isSubscription=false"', function() {
      sinon.stub(calUIAuthorizationService, 'canModifyPublicSelection', angular.noop);
      CalendarConfigurationTabMainController.calendar.isShared = sinon.stub().returns(true);
      CalendarConfigurationTabMainController.calendar.isSubscription = sinon.stub().returns(false);

      CalendarConfigurationTabMainController.$onInit();

      $rootScope.$digest();

      expect(CalendarConfigurationTabMainController.calendar.rights.getShareeRight).to.have.been.called;
      expect(CalendarConfigurationTabMainController.calendar.getOwner).to.have.been.called;
    });

    it('should trigger performExternalCalendarOperations for an external calendar "isShared=false and isSubscription=true"', function() {
      sinon.stub(calUIAuthorizationService, 'canModifyPublicSelection', angular.noop);
      CalendarConfigurationTabMainController.calendar = {
        source: {},
        isShared: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(true),
        isReadable: sinon.stub().returns(true),
        rights: {
          getShareeRight: sinon.spy(function() {
            return CAL_CALENDAR_SHARED_RIGHT.SHAREE_OWNER;
          })
        },
        getOwner: sinon.spy(function() {
          return getOwnerResult;
        })
      };

      CalendarConfigurationTabMainController.$onInit();

      $rootScope.$digest();

      expect(CalendarConfigurationTabMainController.calendar.rights.getShareeRight).to.have.been.called;
      expect(CalendarConfigurationTabMainController.calendar.getOwner).to.have.been.called;
    });

    it('should do nothing for a new calendar', function() {
      sinon.stub(calUIAuthorizationService, 'canModifyPublicSelection', angular.noop);
      CalendarConfigurationTabMainController.newCalendar = true;

      CalendarConfigurationTabMainController.$onInit();

      $rootScope.$digest();

      expect(CalendarConfigurationTabMainController.calendar.rights.getShareeRight).to.not.have.been.called;
      expect(CalendarConfigurationTabMainController.calendar.getOwner).to.not.have.been.called;
    });

    it('should call "calendar.rights.getShareeRight" with "session.user._id"', function() {
      CalendarConfigurationTabMainController.$onInit();

      $rootScope.$digest();

      expect(CalendarConfigurationTabMainController.calendar.rights.getShareeRight).to.have.been.calledWith(session.user._id);
      expect(CalendarConfigurationTabMainController.shareeRight).to.equal(CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN_LABEL);
    });

    it('should set "shareeRight" depending on "calendar.rights.getShareeRight"', function() {
      [
        CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ,
        CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE,
        CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN,
        CAL_CALENDAR_SHARED_RIGHT.SHAREE_FREE_BUSY
      ].forEach(function(sharedRight) {
        getShareeRightResult = sharedRight;
        CalendarConfigurationTabMainController.$onInit();

        $rootScope.$digest();

        expect(CalendarConfigurationTabMainController.calendar.rights.getShareeRight).to.have.been.calledWith(session.user._id);
        expect(CalendarConfigurationTabMainController.shareeRight).to.equal(CalCalendarRightsUtilsService.delegationAsHumanReadable(sharedRight));
      });
    });

    it('should call "getOwner" and set both of "sharedCalendarOwner" and "displayNameOfSharedCalendarOwner"', function() {
      var userUtilsResult = 'Firstname Lastname';

      sinon.stub(userUtils, 'displayNameOf', function() {
        return userUtilsResult;
      });

      CalendarConfigurationTabMainController.$onInit();

      $rootScope.$digest();

      expect(CalendarConfigurationTabMainController.calendar.getOwner).to.have.been.called;
      expect(userUtils.displayNameOf).to.have.been.called;
      expect(CalendarConfigurationTabMainController.sharedCalendarOwner).to.equal(getOwnerResult);
      expect(CalendarConfigurationTabMainController.displayNameOfSharedCalendarOwner).to.equal(userUtilsResult);
    });
  });
});
