'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The calEventAlarmEditionController', function() {
  var $controller, calendarHomeService, asSession, calEventsProviders, CAL_ALARM_TRIGGER;

  beforeEach(function() {

    asSession = {
      user: {
        _id: '123456',
        emails: ['test@open-paas.org'],
        emailMap: {'test@open-paas.org': true}
      },
      domain: {
        company_name: 'test',
        _id: 'domainId'
      },
      ready: {
        then: angular.noop
      }
    };

    calendarHomeService = {
      getUserCalendarHomeId: function() {
        return $q.when(asSession.user._id);
      }
    };

    calEventsProviders = function() {
      return {
        setUpSearchProvider: angular.noop
      };
    };

    angular.mock.module('esn.calendar', function($provide) {
      $provide.value('calendarHomeService', calendarHomeService);
      $provide.value('session', asSession);
      $provide.factory('calEventsProviders', calEventsProviders);
    });

    angular.mock.inject(function(_$controller_, _CAL_ALARM_TRIGGER_, _calEventsProviders_) {
      $controller = _$controller_;
      CAL_ALARM_TRIGGER = _CAL_ALARM_TRIGGER_;
      calEventsProviders = _calEventsProviders_;
    });
  });

  function initController() {
    return $controller('calEventAlarmEditionController', null, { event: {} });
  }

  it('should scope.setEventAlarm set the event alarm', function() {
    var ctrl = initController();

    ctrl.trigger = CAL_ALARM_TRIGGER[1].value;
    ctrl.setEventAlarm();

    expect(ctrl.event).to.deep.equal({
      alarm: {
        trigger: CAL_ALARM_TRIGGER[1].value,
        attendee: 'test@open-paas.org'
      }
    });
  });
});
