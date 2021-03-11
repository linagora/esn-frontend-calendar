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
    calCalendarSecretAddressConfirmationModalService,
    calFullUiConfiguration,
    CAL_CALENDAR_PUBLIC_RIGHT,
    CAL_CALENDAR_SHARED_RIGHT,
    calendar;

  let calCalDAVURLServiceMock, notificationFactoryMock, notificationStrongInfoMock;
  const secretAddress = 'http://top.secret';

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
      }),
      exportCalendar: sinon.spy(),
      getSecretAddress: sinon.spy(function() { return $q.when(secretAddress); })
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
    calCalendarSecretAddressConfirmationModalService = sinon.spy();

    calCalDAVURLServiceMock = {
      getCalendarURL: sinon.stub()
    };

    notificationStrongInfoMock = {
      close: sinon.stub()
    };

    notificationFactoryMock = {
      weakInfo: sinon.stub(),
      strongInfo: sinon.stub().returns(notificationStrongInfoMock)
    };

    angular.mock.module('esn.calendar', function($provide) {
      $provide.value('calendarService', calendarService);
      $provide.value('calCalendarDeleteConfirmationModalService', calCalendarDeleteConfirmationModalService);
      $provide.value('calFullUiConfiguration', calFullUiConfiguration);
      $provide.value('calCalendarSecretAddressConfirmationModalService', calCalendarSecretAddressConfirmationModalService);
      $provide.value('calCalDAVURLService', calCalDAVURLServiceMock);
      $provide.value('notificationFactory', notificationFactoryMock);
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
    calCalDAVURLServiceMock.getCalendarURL.returns($q.when('/some/url'));
    CalendarConfigurationTabMainController = initController();

    CalendarConfigurationTabMainController.calendar = {
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
      },
      rights: {
        getShareeRight: sinon.spy()
      },
      getOwner: () => ({
        preferredEmail: 'preferredEmail'
      })
    };

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

  describe('the caldavurl', function() {
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

    it('should not be initialized if it\'s a new calendar', function() {
      CalendarConfigurationTabMainController.calendar = calendar;
      CalendarConfigurationTabMainController.newCalendar = true;

      CalendarConfigurationTabMainController.$onInit();
      $rootScope.$apply();

      expect(CalendarConfigurationTabMainController.caldavurl).to.be.undefined;
    });

    it('should be initialized in case of an already created calendar', function() {
      CalendarConfigurationTabMainController.calendar = calendar;
      CalendarConfigurationTabMainController.newCalendar = false;

      CalendarConfigurationTabMainController.$onInit();
      $rootScope.$apply();

      expect(CalendarConfigurationTabMainController.caldavurl).to.eq('/some/url');
    });
  });

  describe('the calendarToExport', function() {
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

      expect(CalendarConfigurationTabMainController.calendarToExport).to.be.undefined;
    });

    it('should be initialized with calendar path if not subscription', function() {
      CalendarConfigurationTabMainController.calendar = calendar;

      CalendarConfigurationTabMainController.$onInit();
      $rootScope.$apply();

      const { calendarHomeId, id } = CalendarConfigurationTabMainController.calendarToExport;

      expect(calendarHomeId).to.eq('homeId');
      expect(id).to.eq('id');
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
        },
        rights: {
          getShareeRight: sinon.spy()
        },
        getOwner: () => ({
          preferredEmail: 'preferredEmail'
        })
      };

      CalendarConfigurationTabMainController.calendar = calendar;

      CalendarConfigurationTabMainController.$onInit();
      $rootScope.$apply();

      const { calendarHomeId, id } = CalendarConfigurationTabMainController.calendarToExport;

      expect(calendarHomeId).to.eq('sourceHomeId');
      expect(id).to.eq('sourceId');
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
        isReadable: sinon.stub().returns(true),
        isOwner: sinon.spy()
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
        }),
        isOwner: sinon.spy()
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
        }),
        isOwner: sinon.spy()
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

  describe('the exportCalendar function', () => {
    beforeEach(function() {
      CalendarConfigurationTabMainController.calendar = {
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
        },
        rights: {
          getShareeRight: sinon.spy()
        },
        getOwner: () => ({
          preferredEmail: 'preferredEmail'
        })
      };
    });

    it('should call the calendarService.exportCalendar method', () => {
      CalendarConfigurationTabMainController.$onInit();
      CalendarConfigurationTabMainController.exportCalendar();
      $rootScope.$digest();

      expect(calendarService.exportCalendar).to.have.been.calledWith('sourceHomeId', 'sourceId');
    });
  });

  describe('the getSecretAddress function', function() {
    it('should get the secret address', function(done) {
      CalendarConfigurationTabMainController.getSecretAddress(false)
        .then(() => {
          expect(CalendarConfigurationTabMainController.calendarSecretAddress).to.equal(secretAddress);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));

      const payload = {
        calendarHomeId: CalendarConfigurationTabMainController.calendarHomeId,
        calendarId: CalendarConfigurationTabMainController.calendar.id,
        shouldResetLink: false
      };

      expect(calendarService.getSecretAddress).to.have.been.calledWith(payload);

      $rootScope.$digest();
    });

    it('should get the secret address without forcing it to reset by default', function(done) {
      CalendarConfigurationTabMainController.getSecretAddress()
        .then(() => {
          expect(CalendarConfigurationTabMainController.calendarSecretAddress).to.equal(secretAddress);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));

      const payload = {
        calendarHomeId: CalendarConfigurationTabMainController.calendarHomeId,
        calendarId: CalendarConfigurationTabMainController.calendar.id,
        shouldResetLink: false
      };

      expect(calendarService.getSecretAddress).to.have.been.calledWith(payload);

      $rootScope.$digest();
    });
  });

  describe('the toggleSecretAddressVisibility function', function() {
    it('should display the secret address by default', function() {
      CalendarConfigurationTabMainController.calendarSecretAddress = secretAddress;
      CalendarConfigurationTabMainController.toggleSecretAddressVisibility();

      expect(CalendarConfigurationTabMainController.isSecretAddressShown).to.equal(true);
    });

    it('should toggle the visibility of the secret address', function() {
      CalendarConfigurationTabMainController.toggleSecretAddressVisibility(false);

      expect(CalendarConfigurationTabMainController.isSecretAddressShown).to.equal(false);
    });

    it('should display the secret address as requested after getting it', function() {
      CalendarConfigurationTabMainController.getSecretAddress = sinon.stub().returns($q.when());

      CalendarConfigurationTabMainController.calendarSecretAddress = '';
      CalendarConfigurationTabMainController.toggleSecretAddressVisibility(true);

      expect(CalendarConfigurationTabMainController.getSecretAddress).to.have.been.called;

      $rootScope.$digest();

      expect(CalendarConfigurationTabMainController.isSecretAddressShown).to.equal(true);
    });
  });

  describe('the copySecretAddress function', function() {

  });

  describe('the openResetSecretAddressConfirmationDialog function', function() {
    beforeEach(function() {
      CalendarConfigurationTabMainController.getSecretAddress = sinon.stub().returns($q.when());
    });

    it('should open the confirmation modal to reset the secret address', function(done) {
      CalendarConfigurationTabMainController.$onInit();
      CalendarConfigurationTabMainController.openResetSecretAddressConfirmationDialog();

      expect(calCalendarSecretAddressConfirmationModalService).to.have.been.calledOnce;
      expect(calCalendarSecretAddressConfirmationModalService.getCall(0).args[0]).to.equal(CalendarConfigurationTabMainController.calendar);

      const resetSecretAddress = calCalendarSecretAddressConfirmationModalService.getCall(0).args[1];

      resetSecretAddress();

      $rootScope.$digest();

      expect(CalendarConfigurationTabMainController.getSecretAddress).to.have.been.calledWith(true);
      expect(CalendarConfigurationTabMainController.isSecretAddressShown).to.equal(true);
      expect(notificationFactoryMock.weakInfo).to.have.been.calledWith('', 'Successfully reset secret address');
      done();
    });
  });
});
