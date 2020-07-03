'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The esnResourceAttendeeProvider service', function() {
  var esnResourceAPIClient, esnResourceAttendeeProvider, ESN_RESOURCE_OBJECT_TYPE;

  beforeEach(function() {
    esnResourceAPIClient = {};
    angular.mock.module('linagora.esn.resource');

    angular.mock.module(function($provide) {
      $provide.value('esnResourceAPIClient', esnResourceAPIClient);
    });

    angular.mock.inject(function(_esnResourceAttendeeProvider_, _ESN_RESOURCE_OBJECT_TYPE_) {
      esnResourceAttendeeProvider = _esnResourceAttendeeProvider_;
      ESN_RESOURCE_OBJECT_TYPE = _ESN_RESOURCE_OBJECT_TYPE_;
    });
  });

  it('should contain the right objectType', function() {
    expect(esnResourceAttendeeProvider.objectType).to.equal(ESN_RESOURCE_OBJECT_TYPE);
    expect(esnResourceAttendeeProvider.templateUrl).to.be.defined;
  });
});
