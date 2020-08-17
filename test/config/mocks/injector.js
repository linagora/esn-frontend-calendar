'use strict';

/**
 * Inject angular things globally, for use in frontend unit tests. Add your
 * instance names to the INJECTIONS array and don't forget to modify linter config
 */
var $q = require('q/q.js');

beforeEach(function(){
  window.$q = $q;
});
