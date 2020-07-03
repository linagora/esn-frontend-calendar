'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The CalSettingsDisplayController', function() {

  var $controller, $rootScope, $httpBackend, $scope;
  var esnUserConfigurationService, moduleName, moduleConfiguration, configResponse;

  beforeEach(module(function($provide) {
    $provide.value('asyncAction', sinon.spy(function(message, action) {
      return action();
    }));
  }));

  beforeEach(function() {
    module('esn.calendar');

    moduleName = 'linagora.esn.calendar';
    moduleConfiguration = ['workingDays', 'hideDeclinedEvents'];
    configResponse = [
      { name: 'key1', value: 'value1' },
      { name: 'key2', value: 'value2' }
    ];

    inject(function(
      _$controller_,
      _$rootScope_,
      _$httpBackend_,
      _esnUserConfigurationService_
    ) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      esnUserConfigurationService = _esnUserConfigurationService_;
    });
  });

  function initController(scope) {
    $scope = scope || $rootScope.$new();

    var controller = $controller('CalSettingsDisplayController', { $scope: $scope });

    $scope.$digest();

    return controller;
  }

  it('should get a list configurations from server on init', function() {
    var expectResult = { key1: 'value1', key2: 'value2' };
    var httpResponse = [
        {
          name: moduleName,
          configurations: [{
            name: 'workingDays',
            value: null
          }]
        }
      ];
    var payload = [
      {
        name: moduleName,
        keys: moduleConfiguration
      }
    ];

    esnUserConfigurationService.get = sinon.stub().returns($q.when(configResponse));

    var controller = initController();

    $httpBackend.expectPOST('/api/configurations?scope=user', payload).respond(httpResponse);
    controller.$onInit();
    $rootScope.$digest();

    expect(controller.configurations).to.deep.equal(expectResult);
    expect(esnUserConfigurationService.get).to.have.been.calledWith(moduleConfiguration, moduleName);
  });

  describe('The submit function', function() {
    var form;

    beforeEach(function() {
      form = {
        $valid: true,
        $setPristine: angular.noop,
        $setUntouched: angular.noop
      };

      esnUserConfigurationService.get = function() {
        return $q.when(configResponse);
      };
    });

    it('should call esnUserConfigurationService.set to save configuration', function(done) {
      esnUserConfigurationService.get = sinon.stub().returns($q.when(configResponse));

      var controller = initController();
      var updatedConfigs = {
        key1: 'updatedValue1',
        key2: 'updatedValue2',
        key3: undefined
      };
      var expectedConfigs = [
        { name: 'key1', value: 'updatedValue1' },
        { name: 'key2', value: 'updatedValue2' },
        { name: 'key3', value: false }
      ];

      controller.$onInit();
      $rootScope.$digest();

      controller.configurations = updatedConfigs;
      esnUserConfigurationService.set = sinon.stub().returns($q.when(configResponse));

      controller.submit(form).then(function() {
        expect(esnUserConfigurationService.set).to.have.been.calledWith(expectedConfigs);

        done();
      });

      $scope.$digest();
    });
  });

});
