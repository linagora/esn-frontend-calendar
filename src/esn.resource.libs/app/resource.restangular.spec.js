'use strict';

/* global chai,sinon: false */

const { inject, module } = angular.mock;
const { expect } = chai;

describe('The esnResourceRestangular module', function() {
  let esnResourceRestangular;
  let httpConfigurerMock;

  beforeEach(function() {
    httpConfigurerMock = {
      setBaseUrl: () => { },
      manageRestangular: sinon.stub()
    };
  });

  beforeEach(module('esn.http'));
  beforeEach(module('esn.resource.libs'));

  beforeEach(module(function($provide) {
    $provide.value('httpConfigurer', httpConfigurerMock);
  }));

  beforeEach(inject(function(_esnResourceRestangular_) {
    esnResourceRestangular = _esnResourceRestangular_;
  }));

  it('should register itself to the httpConfigurer.manageRestangular', function() {
    expect(httpConfigurerMock.manageRestangular).to.have.been.calledWith(esnResourceRestangular);
  });
});
