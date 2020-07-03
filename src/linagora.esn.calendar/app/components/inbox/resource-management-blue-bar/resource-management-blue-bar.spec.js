'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calInboxResourceManagementBlueBar component', function() {
  var $compile, $rootScope, scope, element, esnResourceService, esnResourceAPIClient, calEventService, event;

  function initDirective() {
    element = $compile('<div dynamic-directive="inbox-message-info" />')(scope);
    scope.$digest();
  }

  beforeEach(function() {
    module('esn.calendar');
    module('jadeTemplates');

    event = { calendarHomeId: 1 };
    esnResourceAPIClient = { get: sinon.stub() };
    calEventService = { getEvent: sinon.stub() };
    esnResourceService = { getEmail: sinon.stub() };

    module(function($provide) {
      $provide.value('esnResourceAPIClient', esnResourceAPIClient);
      $provide.value('calEventService', calEventService);
      $provide.value('esnResourceService', esnResourceService);
    });
  });

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
  }));

  beforeEach(function() {
    calEventService.getEvent.returns($q.when(event));
    esnResourceAPIClient.get.returns($q.when({}));
  });

  it('should register a dynamic directive to "inbox-message-info"', function() {
    scope.email = {
      headers: {
        'X-Openpaas-Cal-Action': 'RESOURCE_REQUEST',
        'X-Openpaas-Cal-Event-Path': '/foo/bar.ics'
      }
    };
    initDirective();

    expect(element.find('cal-inbox-resource-management-blue-bar')).to.have.length(1);
  });

  it('should not be injected if there is no email in scope', function() {
    initDirective();

    expect(element.find('cal-inbox-resource-management-blue-bar')).to.have.length(0);
  });

  it('should not be injected if email has no headers', function() {
    scope.item = {};
    initDirective();

    expect(element.find('cal-inbox-resource-management-blue-bar')).to.have.length(0);
  });

  it('should not be injected if email has no X-Openpaas-Cal-Action header', function() {
    scope.item = {
      headers: {}
    };
    initDirective();

    expect(element.find('cal-inbox-resource-management-blue-bar')).to.have.length(0);
  });
});
