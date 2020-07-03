(function() {
  'use strict';

  /* global chai, sinon: false, _: false */

  var expect = chai.expect;

  describe('The EventSearchFormController', function() {
    var $controller,
      $scope,
      calendarService,
      session,
      CAL_ADVANCED_SEARCH_CALENDAR_TYPES,
      userCalendars,
      publicCalendars,
      delegatedCalendars,
      subscribedCalendars,
      subscribedCalendarsWithOwnerName,
      fullQuery,
      ownerDisplayName;

    userCalendars = [{
      _id: 'userId1',
      isOwner: function() { return true; },
      isSubscription: function() { return false; },
      isShared: function() { return false; }
    }, {
      _id: 'calId1',
      isOwner: function() { return true; },
      isSubscription: function() { return false; },
      isShared: function() { return false; }
    }];
    publicCalendars = [{
      _id: 'calId2',
      isOwner: function() { return false; },
      isSubscription: function() { return false; },
      isShared: function() { return true; }
    }];
    delegatedCalendars = [{
      _id: 'calId3',
      isOwner: function() { return false; },
      isSubscription: function() { return true; },
      isShared: function() { return false; }
    }];
    subscribedCalendars = publicCalendars.concat(delegatedCalendars);
    ownerDisplayName = 'User1';
    subscribedCalendarsWithOwnerName = subscribedCalendars.map(function(sharedCalendar) {
      return _.assign({}, sharedCalendar, { ownerDisplayName: ownerDisplayName });
    });
    fullQuery = {
      text: 'king',
      advanced: {
        organizers: [{ _id: 'userId1' }],
        attendees: [{ _id: 'userId1' }]
      }
    };

    beforeEach(function() {
      session = {
        user: {
          _id: '123456'
        },
        ready: {
          then: angular.noop
        }
      };

      module('esn.calendar');

      module(function($provide) {
        $provide.value('session', session);
      });

      inject(function($rootScope, _$controller_, _session_, _calendarService_, _CAL_ADVANCED_SEARCH_CALENDAR_TYPES_) {
        $controller = _$controller_;
        calendarService = _calendarService_;
        $scope = $rootScope.$new();
        session = _session_;
        CAL_ADVANCED_SEARCH_CALENDAR_TYPES = _CAL_ADVANCED_SEARCH_CALENDAR_TYPES_;

        calendarService.listPersonalAndAcceptedDelegationCalendars = sinon.stub().returns(
          $q.when(userCalendars.concat(subscribedCalendars))
        );

        calendarService.injectCalendarsWithOwnerName = sinon.stub().returns(
          $q.when(subscribedCalendarsWithOwnerName)
        );
      });
    });

    function initController(bindings) {
      return $controller('EventSearchFormController', { $scope: $scope }, bindings);
    }

    describe('The $onInit function', function() {
      it('should initialize advanced query correctly with default options', function() {
        var bindings = {
          query: {}
        };

        var ctrl = initController(bindings);

        ctrl.$onInit();

        $scope.$digest();

        expect(ctrl.query.advanced).to.deep.equal({
          organizers: [],
          attendees: [],
          contains: '',
          cal: CAL_ADVANCED_SEARCH_CALENDAR_TYPES.ALL_CALENDARS
        });
      });

      it('should initialize advanced query correctly with existing advanced query options', function() {
        fullQuery.advanced.cal = CAL_ADVANCED_SEARCH_CALENDAR_TYPES.MY_CALENDARS;

        var bindings = {
          query: fullQuery
        };

        var ctrl = initController(bindings);

        ctrl.$onInit();

        $scope.$digest();

        expect(ctrl.query.advanced).to.deep.equal({
          organizers: fullQuery.advanced.organizers,
          attendees: fullQuery.advanced.attendees,
          contains: fullQuery.text,
          cal: fullQuery.advanced.cal
        });
      });

      it('should call #calendarService.listPersonalAndAcceptedDelegationCalendars with a good param and set ctrl.calendars correctly', function() {
        fullQuery.advanced.cal = CAL_ADVANCED_SEARCH_CALENDAR_TYPES.ALL_CALENDARS;

        var bindings = {
          query: fullQuery
        };

        var ctrl = initController(bindings);

        ctrl.$onInit();

        $scope.$digest();

        expect(calendarService.listPersonalAndAcceptedDelegationCalendars).to.have.been.calledOnce;
        expect(calendarService.listPersonalAndAcceptedDelegationCalendars).to.have.been.calledWith(session.user._id);
        expect(ctrl.calendars).to.deep.equal({
          myCalendars: userCalendars,
          sharedCalendars: subscribedCalendarsWithOwnerName
        });
      });

      it('should call #calendarService.injectCalendarsWithOwnerName with a good param and then set ctrl.calendars correctly when there is at least one shared calendar', function() {
        fullQuery.advanced.cal = CAL_ADVANCED_SEARCH_CALENDAR_TYPES.ALL_CALENDARS;

        var bindings = {
          query: fullQuery
        };

        var ctrl = initController(bindings);

        ctrl.$onInit();

        $scope.$digest();

        expect(calendarService.injectCalendarsWithOwnerName).to.have.been.calledWith(sinon.match(function(calendarListParam) {
          expect(calendarListParam).to.have.members(subscribedCalendars);

          return true;
        }));
        expect(ctrl.calendars).to.deep.equal({
          myCalendars: userCalendars,
          sharedCalendars: subscribedCalendars.map(function(sharedCalendar) {
            return _.assign({}, sharedCalendar, { ownerDisplayName: ownerDisplayName });
          })
        });
      });

      it('should not call #calendarService.injectCalendarsWithOwnerName when there are no shared calendars', function() {
        fullQuery.advanced.cal = CAL_ADVANCED_SEARCH_CALENDAR_TYPES.ALL_CALENDARS;

        calendarService.listPersonalAndAcceptedDelegationCalendars = sinon.stub().returns(
          $q.when(userCalendars)
        );

        var bindings = {
          query: fullQuery
        };

        var ctrl = initController(bindings);

        ctrl.$onInit();

        $scope.$digest();

        expect(calendarService.injectCalendarsWithOwnerName).to.have.not.been.called;
      });
    });
  });
})();
