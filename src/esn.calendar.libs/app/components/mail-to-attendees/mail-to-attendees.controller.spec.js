'use strict';

/* global sinon, chai */

const { expect } = chai;

describe('The calMailToAttendeesController', function() {
  var $controller, ctrl, calEventUtilsMock;

  beforeEach(function() {
    calEventUtilsMock = {
      getEmailAddressesFromAttendeesExcludingCurrentUser: sinon.stub()
    };

    angular.mock.module('esn.calendar.libs');

    angular.mock.module(function($provide) {
      $provide.value('calEventUtils', calEventUtilsMock);
    });

    angular.mock.inject(function(_$controller_) {
      $controller = _$controller_;
    });

    ctrl = initController();
  });

  function initController() {
    return $controller('calMailToAttendeesController');
  }

  describe('The $onInit function', function() {
    it('should get email list from event attendees', function() {
      ctrl.event = { attendees: [{ email: 'attendee1@test.example' }] };
      ctrl.$onInit();

      expect(calEventUtilsMock.getEmailAddressesFromAttendeesExcludingCurrentUser).to.have.been.calledWith(ctrl.event.attendees);
    });
  });
});
