(function() {
  'use strict';

  /* global chai, sinon: false */

  var expect = chai.expect;

  describe('The CalEventViewController controller', function() {
    var $controller, $scope, calAttendeeService, bindings, CAL_ICAL;
    var userAttendee, resourceAttendee, resourceAttendeeWithDetails;

    beforeEach(function() {
      angular.mock.module('esn.calendar');
      angular.mock.inject(function($rootScope, _$controller_, _calAttendeeService_, _CAL_ICAL_) {
        $controller = _$controller_;
        $scope = $rootScope.$new();
        calAttendeeService = _calAttendeeService_;
        CAL_ICAL = _CAL_ICAL_;
      });

      userAttendee = { _id: 1, cutype: CAL_ICAL.cutype.individual };
      resourceAttendee = { _id: 1, cutype: CAL_ICAL.cutype.resource };
      resourceAttendeeWithDetails = { _id: 1, cutype: CAL_ICAL.cutype.resource, details: true };

      bindings = {
        event: {
          attendees: [userAttendee, resourceAttendee]
        }
      };
    });

    function initController() {
      return $controller('CalEventViewController', { $scope: $scope }, bindings);
    }

    it('The $onInit function', function() {
      var ctrl = initController();

      sinon.spy(calAttendeeService, 'splitAttendeesFromType');
      sinon.stub(calAttendeeService, 'splitAttendeesFromTypeWithResourceDetails', function() {
        return $q.when({
          users: [userAttendee],
          resources: [resourceAttendeeWithDetails]
        });
      });
      ctrl.$onInit();

      expect(calAttendeeService.splitAttendeesFromType).has.been.calledWith(bindings.event.attendees);
      expect(ctrl.attendees).to.deep.equals({
        users: [userAttendee],
        resources: [resourceAttendee]
      });

      $scope.$digest();

      expect(calAttendeeService.splitAttendeesFromTypeWithResourceDetails).has.been.calledWith(bindings.event.attendees);
      expect(ctrl.attendees).to.deep.equals({
        users: [userAttendee],
        resources: [resourceAttendeeWithDetails]
      });
    });
  });
})();
