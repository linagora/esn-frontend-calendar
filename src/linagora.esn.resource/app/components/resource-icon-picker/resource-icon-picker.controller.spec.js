'use strict';

/* global chai */

var expect = chai.expect;

describe('The esnResourceIconPicker controller', function() {
  var $controller, $rootScope, $scope;
  var ctrl;

  beforeEach(function() {
    module('jadeTemplates');
    angular.mock.module('linagora.esn.resource');
  });

  beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  beforeEach(function() {
    ctrl = initController();
  });

  function initController() {
    return $controller('esnResourceIconPickerController', { $scope: $scope }, context);
  }

  describe('The set function', function() {
    it('should set resource icon to selected icon', function() {
      ctrl.selected = 'home';

      ctrl.set();

      expect(ctrl.icon).to.equal(ctrl.selected);
    });
  });

  describe('The select function', function() {
    it('should select an icon', function() {
      ctrl.select('home');

      expect(ctrl.selected).to.equal('home');
    });
  });

  describe('The isSelected function', function() {
    it('should check if icon is selected', function() {
      ctrl.selected = 'home';

      expect(ctrl.isSelected('home')).to.equal(true);
    });

    it('should check if icon is not selected', function() {
      ctrl.selected = 'football';

      expect(ctrl.isSelected('home')).to.equal(false);
    });
  });
});
