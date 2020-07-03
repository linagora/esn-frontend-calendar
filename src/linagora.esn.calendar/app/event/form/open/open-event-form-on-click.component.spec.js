'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The cal-open-event-form-on-click component', function() {

  var $compile, $rootScope, $scope, element, calOpenEventFormSpy, calOpenEventFromSearchFormSpy;

  beforeEach(function() {
    module('esn.calendar');

    calOpenEventFormSpy = sinon.stub();
    calOpenEventFromSearchFormSpy = sinon.stub();

    module(function($provide) {
      $provide.value('calOpenEventForm', calOpenEventFormSpy);
      $provide.value('calOpenEventFromSearchForm', calOpenEventFromSearchFormSpy);
    });
  });

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  function compileDirective(html) {
    element = angular.element(html);
    $compile(element)($scope);
    $scope.$digest();
  }

  it('should call open event form with the given event when clicked', function() {
    $scope.myEvent = { id: 'an event id' };
    $scope.calendarHomeId = 'a calendarHomeId';
    compileDirective('<cal-open-event-form-on-click event="myEvent" calendar-home-id="calendarHomeId"/>');

    element.click();

    expect(calOpenEventFormSpy).to.have.been.calledWith($scope.calendarHomeId, $scope.myEvent);
    expect(calOpenEventFromSearchFormSpy).to.have.not.been.called;
  });

  it('should call open event form with event from search when clicked', function() {
    $scope.myEvent = { id: 'an event id' };
    $scope.calendarHomeId = 'a calendarHomeId';
    compileDirective('<cal-open-event-form-on-click event="myEvent" calendar-home-id="calendarHomeId" is-event-from-search="true"/>');

    element.click();

    expect(calOpenEventFormSpy).to.have.not.been.called;
    expect(calOpenEventFromSearchFormSpy).to.have.been.calledWith($scope.myEvent);
  });
});
