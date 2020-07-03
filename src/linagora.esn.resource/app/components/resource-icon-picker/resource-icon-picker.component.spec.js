'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The esn-resource-icon-picker component', function() {

  var $compile, $rootScope, $scope, $modal, element;

  beforeEach(function() {
    angular.mock.module('linagora.esn.resource');
    module('jadeTemplates');

    $modal = sinon.spy();

    module(function($provide) {
      $provide.value('$modal', $modal);
    });
  });

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  function compileComponent(html) {
    element = angular.element(html);
    $compile(element)($scope);
    $scope.$digest();
  }

  it('should call "resource-icon-picker-modal" modal when clicked on select', function() {
    compileComponent('<esn-resource-icon-picker/>');

    element.find('.select')[0].click();

    expect($modal).to.have.been.called;
  });
});
