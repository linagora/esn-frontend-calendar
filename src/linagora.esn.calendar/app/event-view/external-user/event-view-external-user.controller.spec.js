(function() {
  'use strict';

  /* global chai, sinon: false */

  var expect = chai.expect;

  describe('The CalEventViewExternalUserController controller', function() {
    var $httpBackend, $controller, $scope, notificationFactory, esnI18nService, bindings, organizerAttendee, userAttendee, resourceAttendee, CAL_ICAL;

    beforeEach(function() {
      angular.mock.module('esn.calendar');
      angular.mock.inject(function($rootScope, _$controller_, _$httpBackend_, _notificationFactory_, _esnI18nService_, _CAL_ICAL_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();
        notificationFactory = _notificationFactory_;
        esnI18nService = _esnI18nService_;
        CAL_ICAL = _CAL_ICAL_;
      });

      organizerAttendee = { _id: 1, cutype: CAL_ICAL.cutype.individual, email: 'organizer@mail.m' };
      userAttendee = { _id: 2, cutype: CAL_ICAL.cutype.individual, email: 'user@mail.m' };
      resourceAttendee = { _id: 12345, cutype: CAL_ICAL.cutype.resource, email: '12345@mail.m' };

      bindings = {
        attendees: {
          users: [organizerAttendee, userAttendee],
          resources: [resourceAttendee]
        },
        event: {
          organizer: { email: 'organizer@mail.m' }
        },
        externalAttendee: userAttendee,
        links: {
          yes: 'linkYes',
          maybe: 'linkMaybe',
          no: 'linkNo'
        }
      };
    });

    function initController() {
      return $controller('CalEventViewExternalUserController', { $scope: $scope }, bindings);
    }

    it('The $onInit function', function() {
      var ctrl = initController();

      ctrl.$onInit();
      $scope.$digest();

      expect(ctrl.userAsAttendee).to.deep.equals(bindings.externalAttendee);
      expect(ctrl.selectedTab).to.deep.equals('attendees');
      expect(ctrl.linksMapping).to.deep.equals({
        ACCEPTED: bindings.links.yes,
        TENTATIVE: bindings.links.maybe,
        DECLINED: bindings.links.no
      });
      expect(ctrl.organizerAttendee).to.deep.equals(organizerAttendee);
      expect(ctrl.usersAttendeesList).to.deep.equals([userAttendee]);
    });

    it('The changeParticipation function', function() {
      var ctrl = initController();

      $httpBackend.expectGET(bindings.links.yes).respond(200, {});
      sinon.spy(notificationFactory, 'weakInfo');
      sinon.spy(esnI18nService, 'translate');

      ctrl.$onInit();
      $scope.$digest();

      ctrl.changeParticipation(CAL_ICAL.partstat.accepted);
      $scope.$digest();
      $httpBackend.flush();

      expect(ctrl.userAsAttendee.partstat).to.deep.equals(CAL_ICAL.partstat.accepted);
      expect(ctrl.usersAttendeesList).to.deep.equals([ctrl.userAsAttendee]);
      expect(notificationFactory.weakInfo).has.been.calledWith();
      expect(esnI18nService.translate).has.been.calledWith();
    });
  });
})();
