angular.module('esnApp', [
  'esn.calendar',
  'linagora.esn.resource',
  'esn.resource.libs',
  'esn.calendar.libs',
  'ui.router',
  'esn.session',
  'esn.websocket',
  'esn.configuration',
  'esn.login',
  'esn.i18n',
  'esn.material',
  'linagora.esn.group',
  'openpaas-logo',
  'ngTagsInput'
]);

require('esn-frontend-common-libs/src/frontend/js/modules/session');
require('esn-frontend-common-libs/src/frontend/js/modules/websocket');
require('esn-frontend-common-libs/src/frontend/js/modules/config/config.module');
require('esn-frontend-common-libs/src/frontend/js/modules/i18n/i18n.module');
require('esn-frontend-common-libs/src/frontend/js/modules/login');
require('esn-frontend-common-libs/src/frontend/js/modules/material/material.module');

require('esn-frontend-group/src/app/app.constants');
require('esn-frontend-group/src/app/app.run');

require('esn-frontend-group/src/app/common/group-member-resolver.service');
require('esn-frontend-group/src/app/attendee/group.attendee-provider.service');

require('../esn.resource.libs/app/app.module.js');
require('../esn.calendar.libs/app/app.module.js');

require('../linagora.esn.calendar/app/app.js');
require('../linagora.esn.resource/app/app.js');
require('./app.config');
require('./app.run');
