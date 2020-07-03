'use strict';

describe('The esnResourceAPIClient service', function() {
  var $httpBackend, esnResourceAPIClient;

  beforeEach(function() {
    angular.mock.module('linagora.esn.resource');
  });

  beforeEach(function() {
    inject(function(_esnResourceAPIClient_, _$httpBackend_) {
      $httpBackend = _$httpBackend_;
      esnResourceAPIClient = _esnResourceAPIClient_;
    });
  });

  describe('The create function', function() {
    it('should call the REST API', function(done) {
      var resource = {
        name: 'The resource name',
        description: 'The resource description',
        type: 'calendar'
      };

      $httpBackend.expectPOST('/linagora.esn.resource/api/resources', resource).respond(201, {});
      esnResourceAPIClient.create(resource).then(function() {
        done();
      }, done);
      $httpBackend.flush();
    });
  });

  describe('The update function', function() {
    it('should call the REST API', function(done) {
      var resource = {
        _id: 'id',
        name: 'The resource name',
        description: 'The resource description',
        type: 'calendar'
      };

      $httpBackend.expectPUT('/linagora.esn.resource/api/resources/id', resource).respond(201, {});
      esnResourceAPIClient.update(resource).then(function() {
        done();
      }, done);
      $httpBackend.flush();
    });
  });

  describe('The list function', function() {
    it('should call the REST API with right parameters', function(done) {
      var data = [1, 2, 3];
      var creator = 'userId';
      var limit = '10';
      var offset = '50';

      $httpBackend.expectGET('/linagora.esn.resource/api/resources?creator=userId&limit=10&offset=50').respond(data);
      esnResourceAPIClient.list({limit: limit, offset: offset, creator: creator}).then(function() {
        done();
      }, done);
      $httpBackend.flush();
    });
  });

  describe('The get function', function() {
    it('should call the REST API with right parameters', function(done) {
      var data = [1, 2, 3];
      var id = 'resourceId';

      $httpBackend.expectGET('/linagora.esn.resource/api/resources/' + id).respond(data);
      esnResourceAPIClient.get(id).then(function() {
        done();
      }, done);
      $httpBackend.flush();
    });
  });

  describe('The search function', function() {
    it('should call the REST API with right parameters', function(done) {
      var data = [1, 2, 3];
      var term = 'termtosearch';
      var limit = '10';
      var offset = '50';

      $httpBackend.expectGET('/linagora.esn.resource/api/resources?limit=10&offset=50&query=termtosearch').respond(data);
      esnResourceAPIClient.search(term, limit, offset).then(function() {
        done();
      }, done);
      $httpBackend.flush();
    });
  });

  describe('The remove function', function() {
    it('should call the REST API', function(done) {
      var resourceId = 'id';

      $httpBackend.expectDELETE('/linagora.esn.resource/api/resources/' + resourceId).respond(201, {});
      esnResourceAPIClient.remove(resourceId).then(function() {
        done();
      }, done);
      $httpBackend.flush();
    });
  });
});
