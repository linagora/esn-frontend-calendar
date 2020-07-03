'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The calInboxResourceManagementIndicator component', function() {

  var $compile, $rootScope, scope, element;

  function initDirective() {
    element = $compile('<div dynamic-directive="inbox-message-indicators" />')(scope);
    scope.$digest();
  }

  beforeEach(function() {
    module('esn.calendar');
    module('jadeTemplates');
  });

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    scope = $rootScope.$new();
  }));

  it('should register a dynamic directive to "inbox-message-indicators"', function() {
    scope.item = {
      headers: {
        'X-Openpaas-Cal-Action': 'RESOURCE_REQUEST'
      }
    };
    initDirective();

    expect(element.find('cal-inbox-resource-management-indicator')).to.have.length(1);
  });

  it('should not be injected if there is no item in scope', function() {
    initDirective();

    expect(element.find('cal-inbox-resource-management-indicator')).to.have.length(0);
  });

  it('should not be injected if item has no headers', function() {
    scope.item = {};
    initDirective();

    expect(element.find('cal-inbox-resource-management-indicator')).to.have.length(0);
  });

  it('should not be injected if item has no X-Openpaas-Cal-Action header', function() {
    scope.item = {
      headers: {}
    };
    initDirective();

    expect(element.find('cal-inbox-resource-management-indicator')).to.have.length(0);
  });

  it('should add directive if scope.item changes to a event item', function() {
    scope.item = {};
    initDirective();

    expect(element.find('cal-inbox-resource-management-indicator')).to.have.length(0);

    scope.item.headers = {
      'X-Openpaas-Cal-Action': 'RESOURCE_REQUEST'
    };
    scope.$digest();

    expect(element.find('cal-inbox-resource-management-indicator')).to.have.length(1);
  });
});
