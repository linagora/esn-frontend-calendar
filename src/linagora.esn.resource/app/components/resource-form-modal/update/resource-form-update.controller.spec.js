'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The ESNResourceFormUpdateController controller', function() {
  var $q, $state, $controller, $rootScope, resource, resourceUpdated, esnResourceAPIClient, sessionMock, asyncAction, resourceType;

  beforeEach(function() {
    module('jadeTemplates');
    angular.mock.module('linagora.esn.resource');
  });

  beforeEach(function() {
    resourceType = 'resource';
    resource = {
      name: 'Foo udpated',
      description: 'bar updated',
      type: resourceType,
      administrators: [{
        _id: 'tupleId',
        id: 'userId',
        objectType: 'user'
      }]
    };

    asyncAction = sinon.spy();
    esnResourceAPIClient = {};

    sessionMock = {
      ready: {
        then: angular.noop
      },
      user: {
        _id: 3
      }
    };

    module(function($provide) {
      $provide.value('asyncAction', asyncAction);
      $provide.value('esnResourceAPIClient', esnResourceAPIClient);
      $provide.value('session', sessionMock);
    });
  });

  beforeEach(angular.mock.inject(function(_$state_, _$controller_, _$rootScope_, _$q_, _esnResourceAPIClient_) {
    $state = _$state_;
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    esnResourceAPIClient = _esnResourceAPIClient_;
  }));

  function initController(locals) {
    return $controller('ESNResourceFormUpdateController', locals || {});
  }

  describe('The submit function', function() {
    var ctrl;

    beforeEach(function() {
      ctrl = initController({type: undefined, resource: resource});

      resourceUpdated = {
        name: 'Foo udpated',
        description: 'bar updated',
        type: resourceType,
        administrators: [{
          _id: 'tupleId',
          id: 'userId',
          objectType: 'user'
        }]
      };
    });

    it('should call the resourceAPIClient.update correctly and reload the resources', function() {
      esnResourceAPIClient.update = sinon.stub().returns($q.when());
      var goSpy = sinon.spy($state, 'reload');

      ctrl.beAdmin = false;
      ctrl.submit();
      asyncAction.firstCall.args[1]();
      $rootScope.$digest();

      expect(esnResourceAPIClient.update).to.have.been.calledWith(resource);

      expect(goSpy).to.have.been.called;
    });

    it('should add the administrators ', function() {
      esnResourceAPIClient.update = sinon.stub().returns($q.when());
      var goSpy = sinon.spy($state, 'reload');

      resourceUpdated.administrators.push({
        id: 1,
        objectType: 'user'
      });
      ctrl.resourceAdministrators = [
        {
          _id: 1
        }
      ];

      ctrl.submit();
      asyncAction.firstCall.args[1]();

      $rootScope.$digest();

      expect(esnResourceAPIClient.update).to.have.been.calledWith(resourceUpdated);
      expect(goSpy).to.have.been.called;
    });

    it('should add the creator in administrators field if the checkbox is checked', function() {
      esnResourceAPIClient.update = sinon.stub().returns($q.when());
      var goSpy = sinon.spy($state, 'reload');

      resourceUpdated.administrators.push({
        id: 3,
        objectType: 'user'
      });
      ctrl.beAdmin = true;
      ctrl.submit();
      asyncAction.firstCall.args[1]();
      $rootScope.$digest();

      expect(esnResourceAPIClient.update).to.have.been.calledWith(resourceUpdated);
      expect(goSpy).to.have.been.called;
    });

    it('should not add the creator in administrators field if he is already added', function() {
      esnResourceAPIClient.update = sinon.stub().returns($q.when());
      var goSpy = sinon.spy($state, 'reload');

      resourceUpdated.administrators.push({
        id: 3,
        objectType: 'user'
      });
      ctrl.resourceAdministrators = [
        {
          _id: 3
        }
      ];
      ctrl.beAdmin = true;
      ctrl.submit();
      asyncAction.firstCall.args[1]();
      $rootScope.$digest();

      expect(esnResourceAPIClient.update).to.have.been.calledWith(resourceUpdated);
      expect(goSpy).to.have.been.called;
    });

  });
});
