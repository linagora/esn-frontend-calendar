'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('the CalendarsListItemConfiguration controller', function() {
  var $controller, CalendarsListItemConfiguration, calendarUniqueId, $stateMock;

  beforeEach(function() {
    calendarUniqueId = '123';

    $stateMock = {
      go: sinon.spy()
    };

    angular.mock.module('esn.calendar');

    angular.mock.module(function($provide) {
      $provide.value('$state', $stateMock);
    });

    angular.mock.inject(function(_$controller_) {
      $controller = _$controller_;
    });
  });

  beforeEach(function() {
    CalendarsListItemConfiguration = $controller('CalendarsListItemConfigurationController');

    CalendarsListItemConfiguration.$onInit();
  });

  describe('goTo function', function() {

    it('should call $state.go with calendarUniqueId', function() {
      var stateToGo = 'calendar.edit';
      CalendarsListItemConfiguration.calendarId = calendarUniqueId;

      CalendarsListItemConfiguration.onOptionClick();

      expect($stateMock.go).to.have.been.calledWith(stateToGo, { calendarUniqueId: calendarUniqueId });
    });
  });
});
