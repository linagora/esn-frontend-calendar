'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The CalSettingsDisplayController', function() {

  var $controller, $rootScope, $httpBackend, $scope, $state;
  var esnUserConfigurationService, moduleName, moduleConfiguration, configResponse, calSettingsService;

  beforeEach(angular.mock.module(function($provide) {
    $provide.value('asyncAction', sinon.spy(function(message, action) {
      return action();
    }));
  }));

  beforeEach(function() {
    angular.mock.module('esn.calendar');

    moduleName = 'linagora.esn.calendar';
    moduleConfiguration = ['workingDays', 'hideDeclinedEvents'];
    configResponse = [
      { name: 'key1', value: 'value1' },
      { name: 'key2', value: 'value2' }
    ];

    inject(function(
      _$state_,
      _$controller_,
      _$rootScope_,
      _$httpBackend_,
      _esnUserConfigurationService_,
      _calSettingsService_
    ) {
      $state = _$state_;
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      esnUserConfigurationService = _esnUserConfigurationService_;
      calSettingsService = _calSettingsService_;
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
      calSettingsService.updateStatus = sinon.spy();

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
        expect(calSettingsService.updateStatus).to.have.been.calledWith('updating');
        expect(esnUserConfigurationService.set).to.have.been.calledWith(expectedConfigs);

        done();
      });

      $scope.$digest();
    });

    it('should redirect users to the calendar main page after saving configuration successfully', function(done) {
      calSettingsService.updateStatus = sinon.spy();

      esnUserConfigurationService.get = () => $q.when(configResponse);
      $state.go = sinon.stub();

      const controller = initController();
      const updatedConfigs = {
        key1: 'updatedValue1',
        key2: 'updatedValue2'
      };

      controller.$onInit();
      $rootScope.$digest();

      controller.configurations = updatedConfigs;
      esnUserConfigurationService.set = () => $q.when(configResponse);

      controller.submit(form)
        .then(() => {
          expect(calSettingsService.updateStatus).to.have.been.calledWith('updating');
          expect(calSettingsService.updateStatus).to.have.been.calledWith('updated');
          done();
        })
        .catch(err => {
          expect(calSettingsService.updateStatus).to.have.been.calledWith('failed');
          done(err || new Error('should resolve'));
        });

      $scope.$digest();
    });
  });
});
