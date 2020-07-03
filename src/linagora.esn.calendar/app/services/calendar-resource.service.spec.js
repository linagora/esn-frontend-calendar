'use strict';

/* global chai */

var expect = chai.expect;

describe('The calResourceService service', function() {
  var calResourceService, $httpBackend, ESN_RESOURCE, resourceId, eventId;

  beforeEach(function() {
    resourceId = '1';
    eventId = '2';
  });

  beforeEach(function() {
    module('linagora.esn.resource');
    module('esn.calendar');
  });

  beforeEach(function() {
    angular.mock.inject(function(_$httpBackend_, _calResourceService_, _ESN_RESOURCE_) {
      $httpBackend = _$httpBackend_;
      calResourceService = _calResourceService_;
      ESN_RESOURCE = _ESN_RESOURCE_;
    });
  });

  describe('The acceptResourceReservation function', function() {
    it('should call the API correctly', function() {
      $httpBackend.expect('GET', '/calendar/api/resources/' + resourceId + '/' + eventId + '/participation?status=ACCEPTED').respond({});

      calResourceService.acceptResourceReservation(resourceId, eventId);

      $httpBackend.flush();
    });
  });

  describe('The declineResourceReservation function', function() {
    it('should call the API correctly', function() {
      $httpBackend.expect('GET', '/calendar/api/resources/' + resourceId + '/' + eventId + '/participation?status=DECLINED').respond({});

      calResourceService.declineResourceReservation(resourceId, eventId);

      $httpBackend.flush();
    });
  });

  describe('The geResourceIcon function', function() {
    it('should call the API correctly', function() {
      $httpBackend.expectGET('/linagora.esn.resource/api/resources/' + resourceId).respond({});

      calResourceService.getResourceIcon(resourceId);

      $httpBackend.flush();
    });

    it('should return a resource icon', function(done) {
      var resource = {
        name: 'home',
        icon: 'home'
      };

      $httpBackend.expectGET('/linagora.esn.resource/api/resources/' + resourceId).respond(resource);

      calResourceService.getResourceIcon(resourceId).then(function(icon) {
        expect(icon).to.equal(ESN_RESOURCE.ICONS[resource.icon]);
        done();
      });

      $httpBackend.flush();
    });

    it('should return a default resource icon when no resource icon defined', function(done) {
      var resource = {
        name: 'home'
      };

      $httpBackend.expectGET('/linagora.esn.resource/api/resources/' + resourceId).respond(resource);

      calResourceService.getResourceIcon(resourceId).then(function(icon) {
        expect(icon).to.equal(ESN_RESOURCE.DEFAULT_ICON);
        done();
      });

      $httpBackend.flush();
    });
  });
});
