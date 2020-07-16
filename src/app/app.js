angular.module('esnApp', [
  'esn.calendar',
  'linagora.esn.resource',
  'ui.router',
  'esn.session',
  'esn.websocket',
  'esn.configuration',
  'esn.i18n',
  'xeditable',
  'openpaas-logo'
]);

require('esn-frontend-common-libs/src/frontend/js/modules/session');
require('esn-frontend-common-libs/src/frontend/js/modules/websocket');
require('esn-frontend-common-libs/src/frontend/js/modules/config/config.module');
require('esn-frontend-common-libs/src/frontend/js/modules/i18n/i18n.module');

require('../linagora.esn.calendar/app/app.js');
require('../linagora.esn.resource/app/app.js');
require('./app.config');
require('./app.run');
