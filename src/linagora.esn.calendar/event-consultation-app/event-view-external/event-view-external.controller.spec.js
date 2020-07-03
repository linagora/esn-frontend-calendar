(function() {
  'use strict';

  /* global chai, sinon: false */

  var expect = chai.expect;

  describe('The CalEventViewExternalController controller', function() {
    var $controller, $scope, CalendarShellMock, bindings, userAttendee, resourceAttendee;

    beforeEach(function() {
      CalendarShellMock = {
        from: sinon.spy(function() {
          return {
            attendees: [userAttendee, resourceAttendee]
          };
        })
      };

      angular.mock.module('esn.calendar', function($provide) {
        $provide.value('CalendarShell', CalendarShellMock);
      });

      angular.mock.inject(function($rootScope, _$controller_) {
        $controller = _$controller_;
        $scope = $rootScope.$new();
      });

      userAttendee = { _id: 1, email: 'user@mail.m' };
      resourceAttendee = { _id: 1 };

      bindings = {
        attendeeEmail: 'user@mail.m',
        eventJcal: 'eventJcal'
      };
    });

    function initController() {
      return $controller('CalEventViewExternalController', { $scope: $scope }, bindings);
    }

    it('The $onInit function', function() {
      var ctrl = initController();

      ctrl.$onInit();
      $scope.$digest();

      expect(CalendarShellMock.from).has.been.calledWith(bindings.eventJcal);
      expect(ctrl.externalAttendee).to.deep.equals(userAttendee);
    });
  });
})();
