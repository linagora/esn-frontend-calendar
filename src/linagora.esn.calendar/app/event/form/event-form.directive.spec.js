'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The cal-event-form Angular module directives', function() {
  beforeEach(function() {
    module('jadeTemplates');
    angular.mock.module('esn.calendar');
    this.calEventUtilsMock = {};
    this.calEventFormControllerMock = function($scope) {
      $scope.initFormData = function() {};
    };
    this.esnI18nDateFormatService = {
      getLongDateFormat: sinon.spy()
    };
    var self = this;

    angular.mock.module(function($provide, $controllerProvider) {
      $controllerProvider.register('CalEventFormController', self.calEventFormControllerMock);
      $provide.value('calEventUtils', self.calEventUtilsMock);
      $provide.value('esnI18nDateFormatService', self.esnI18nDateFormatService);
      $provide.factory('eventRecurrenceEditionDirective', function() { return {}; });
      $provide.factory('esnDatePickerDirective', function() {
        return [];
      });
    });
  });

  beforeEach(angular.mock.inject(function($timeout, $compile, $rootScope, calMoment) {
    this.$timeout = $timeout;
    this.$compile = $compile;
    this.$rootScope = $rootScope;
    this.$scope = this.$rootScope.$new();
    this.calMoment = calMoment;

    this.$scope.editedEvent = {
      allDay: true,
      start: this.calMoment('2013-02-08 12:30'),
      end: this.calMoment('2013-02-08 13:30'),
      location: 'aLocation'
    };

    this.initDirective = function(scope) {
      var html = '<cal-event-form/>';
      var element = this.$compile(html)(scope);

      scope.$digest();

      return element;
    };
  }));

  it('should prevent default back behavior when modal is shown', function() {
    this.$scope.$hide = sinon.spy();
    this.initDirective(this.$scope);
    this.$scope.$isShown = true;
    var event = this.$scope.$broadcast('$locationChangeStart');

    expect(event.defaultPrevented).to.be.true;
    expect(this.$scope.$hide).to.have.been.calledOnce;
  });

  it('should not prevent default back behavior when modal is not shown', function() {
    this.initDirective(this.$scope);
    this.$scope.$isShown = false;
    var event = this.$scope.$broadcast('$locationChangeStart');

    expect(event.defaultPrevented).to.be.false;
  });

  it('should not prevent default back behavior when modal is undefined', function() {
    this.initDirective(this.$scope);
    var event = this.$scope.$broadcast('$locationChangeStart');

    expect(event.defaultPrevented).to.be.false;
  });
});
