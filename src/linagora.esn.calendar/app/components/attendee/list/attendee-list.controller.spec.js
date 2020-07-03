'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The CalAttendeeListController controller', function() {
  var calAttendeeService, context, $controller, $q, $scope, $rootScope;

  beforeEach(function() {
    module('jadeTemplates');
    angular.mock.module('esn.calendar');
  });

  beforeEach(function() {
    calAttendeeService = {
      getUserDisplayNameForAttendee: sinon.stub()
    };

    angular.mock.module(function($provide) {
      $provide.value('calAttendeeService', calAttendeeService);
    });
  });

  beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, _$q_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    $scope = $rootScope.$new();
    context = {};
    context.attendees = [
      { email: 'other1@example.com', partstat: 'NEEDS-ACTION' },
      { email: 'other2@example.com', partstat: 'ACCEPTED' },
      { email: 'other3@example.com', partstat: 'DECLINED' },
      { email: 'other4@example.com', partstat: 'TENTATIVE' },
      { email: 'other5@example.com', partstat: 'YOLO' }
    ];

    calAttendeeService.getUserDisplayNameForAttendee.returns($q.when());
  }));

  function initController() {
    return $controller('CalAttendeeListController', {$scope: $scope}, context);
  }

  describe('The $onInit function', function() {
    it('should set organizer flag to organizer', function() {
      context.organizer = { email: context.attendees[1].email };

      var ctrl = initController();

      ctrl.$onInit();

      expect(ctrl.attendees[1].organizer).to.be.true;
    });

    it('should update the attendees display name', function() {
      var ctrl = initController();

      ctrl.$onInit();

      expect(calAttendeeService.getUserDisplayNameForAttendee.callCount).to.equal(context.attendees.length);
    });
  });

  describe('The removeAttendee function', function() {
    it('should call onAttendeeRemoved with removed attendee', function() {
      var ctrl = initController();

      ctrl.onAttendeeRemoved = sinon.spy();
      ctrl.$onInit();
      ctrl.removeAttendee(context.attendees[0]);

      expect(ctrl.onAttendeeRemoved).to.have.been.calledWith({ attendee: context.attendees[0] });
    });
  });
});
