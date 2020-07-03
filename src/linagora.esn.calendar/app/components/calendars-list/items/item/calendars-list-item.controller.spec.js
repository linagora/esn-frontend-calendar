'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The CalendarsListItemController controller', function() {
  var $controller, $rootScope, $httpBackend, calendarService, ESN_RESOURCE;
  var calendar, displayName, resource;

  beforeEach(function() {
    displayName = 'The user display name';
    calendarService = {
      getOwnerDisplayName: sinon.stub(),
      getResourceDescription: sinon.stub()
    };
    resource = {
      name: 'home',
      icon: 'the icon',
      description: 'Description of the resource'
    };
    calendar = {
      source: {
        calendarHomeId: '1',
        description: 'The calendar source description'
      },
      isResource: sinon.stub()
    };

    angular.mock.module('linagora.esn.resource');
    angular.mock.module('esn.calendar');

    angular.mock.module(function($provide) {
      $provide.value('calendarService', calendarService);
    });

    angular.mock.inject(function(_$controller_, _$rootScope_, _$httpBackend_, _ESN_RESOURCE_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      ESN_RESOURCE = _ESN_RESOURCE_;
    });
  });

  function initController() {
    return $controller('CalendarsListItemController');
  }

  describe('The $onInit function', function() {
    it('should set the ctrl.details property when ctrl.showDetails is truthy', function() {
      var controller = initController();

      calendar.isResource.returns(false);
      calendarService.getOwnerDisplayName.returns($q.resolve(displayName));
      controller.showDetails = true;
      controller.calendar = calendar;
      controller.$onInit();
      $rootScope.$digest();

      expect(calendarService.getOwnerDisplayName).to.have.been.calledWith(calendar);
      expect(controller.details).to.equal(displayName);
    });

    it('should not set the ctrl.details property when ctrl.showDetails is falsy', function() {
      var controller = initController();

      calendarService.getOwnerDisplayName.returns($q.resolve(displayName));
      controller.calendar = calendar;
      controller.$onInit();
      $rootScope.$digest();

      expect(calendarService.getOwnerDisplayName).to.have.not.been.called;
      expect(controller.details).to.not.be.defined;
    });

    describe('When calendar is a resource', function() {
      it('should set details from resource name', function() {
        var controller = initController();

        $httpBackend.expectGET('/linagora.esn.resource/api/resources/' + calendar.source.calendarHomeId).respond(resource);

        calendar.isResource.returns(true);
        calendarService.getResourceDescription.returns($q.resolve(resource.description));
        controller.showDetails = true;
        controller.calendar = calendar;

        controller.$onInit();
        $httpBackend.flush();
        $rootScope.$digest();

        expect(calendarService.getResourceDescription).to.have.been.called;
        expect(controller.details).to.equal(resource.description);
      });
    });

    it('should set calendar resource icon when calendar of a resource with an icon', function() {
      var controller = initController();

      calendar.isResource.returns(true);
      $httpBackend.expectGET('/linagora.esn.resource/api/resources/' + calendar.source.calendarHomeId).respond(resource);
      controller.calendar = calendar;

      controller.$onInit();
      $httpBackend.flush();
      $rootScope.$digest();

      expect(controller.resourceIcon).to.be.equal(ESN_RESOURCE.ICONS[resource.icon]);
    });

    it('should set default calendar resource icon when calendar of a resource without icon', function() {
      var controller = initController();

      delete resource.icon;

      calendar.isResource.returns(true);
      $httpBackend.expectGET('/linagora.esn.resource/api/resources/' + calendar.source.calendarHomeId).respond(resource);
      controller.calendar = calendar;

      controller.$onInit();
      $httpBackend.flush();
      $rootScope.$digest();

      expect(controller.resourceIcon).to.be.equal(ESN_RESOURCE.DEFAULT_ICON);
    });
  });
});
