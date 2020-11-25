'use strict';

angular.module('esn.resource.libs', [
  'restangular',
  'esn.http'
]);

require('./resource.api-client.js');
require('./resource.restangular.js');
require('./resource.service.js');
require('./resource.constants.js');

require('esn-frontend-common-libs/src/frontend/js/modules/http.js');
