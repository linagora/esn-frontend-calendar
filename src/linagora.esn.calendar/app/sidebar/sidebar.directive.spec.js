'use strict';

/* global chai: false */
var expect = chai.expect;

describe('The calSidebar directive', function() {
  var CAL_LEFT_PANEL_BOTTOM_MARGIN;
  var CAL_EVENTS;
  var calendarServiceMock;

  beforeEach(function() {
    calendarServiceMock = {
      listPersonalAndAcceptedDelegationCalendars: function() {
        return Promise.resolve([]);
      }
    };

    angular.mock.module('linagora.esn.graceperiod', 'esn.calendar', function($provide) {
      $provide.value('calendarService', calendarServiceMock);
      $provide.factory('esnCalendarDirective', function() {
        return [];
      });
    });
  });

  beforeEach(angular.mock.inject(function(_$compile_, _$rootScope_, _$q_) {
    this.$compile = _$compile_;
    this.$rootScope = _$rootScope_;
    this.$scope = this.$rootScope.$new();
    this.$q = _$q_;
    var self = this;

    this.initDirective = function(scope) {
      var element = self.$compile('<cal-sidebar/>')(scope);

      element = self.$compile(element)(scope);
      scope.$digest();

      return element;
    };

    angular.mock.inject(function(_CAL_LEFT_PANEL_BOTTOM_MARGIN_, _CAL_EVENTS_) {
      CAL_LEFT_PANEL_BOTTOM_MARGIN = _CAL_LEFT_PANEL_BOTTOM_MARGIN_;
      CAL_EVENTS = _CAL_EVENTS_;
    });
  }));

  it('change element height on calendar:height', function(done) {
    var element = this.initDirective(this.$scope);

    this.$rootScope.$broadcast(CAL_EVENTS.CALENDAR_HEIGHT, 1200);

    setTimeout(() => {
      expect(element.height()).to.equal(1200 - CAL_LEFT_PANEL_BOTTOM_MARGIN);
      done();
    }, 0);
  });
});
