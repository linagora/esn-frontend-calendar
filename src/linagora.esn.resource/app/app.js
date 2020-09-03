'use strict';

angular.module('linagora.esn.resource', [
  'esn.attendee',
  'esn.session',
  'esn.user',
  'op.dynamicDirective',
  'ui.router',
  'mgcrea.ngStrap.modal',
  'restangular',
  'esn.resource.libs'
]);

require('esn-frontend-common-libs/src/frontend/js/modules/notification.js');
require('esn-frontend-common-libs/src/frontend/js/modules/i18n/i18n.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/core.js');
require('esn-frontend-common-libs/src/frontend/js/modules/attendee/attendee.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/user/user.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/session.js');
require('esn-frontend-common-libs/src/frontend/js/modules/async-action.js');
require('esn-frontend-common-libs/src/frontend/js/modules/infinite-list/infinite-list.module.js');

require('../../esn.resource.libs/app/app.module.js');

require ('./attendee-provider/attendee-provider.service.js');
require ('./avatar/resource-avatar.component.js');
require ('./avatar/resource-avatar.controller.js');
require ('./components/resource-form-modal/create/resource-form-create.controller.js');
require ('./components/resource-form-modal/update/resource-form-update.controller.js');
require ('./components/resource-icon-picker/resource-icon-picker.component.js');
require ('./components/resource-icon-picker/resource-icon-picker.controller.js');
require ('./create/resource-create.component.js');
require ('./create/resource-create.controller.js');
require ('./list-administrator/item/resource-administrator-list-item.component.js');
require ('./list-administrator/item/user/resource-administrator-list-item-user.component.js');
require ('./list-administrator/item/user/resource-administrator-list-item-user.controller.js');
require ('./list-administrator/resource-administrator-list.component.js');
require ('./list/item/admin-links/resource-list-item-dropdown-admin-links.directive.js');
require ('./list/item/admin-links/resource-list-item-dropdown-admin-links.run.js');
require ('./list/item/resource-list-item.component.js');
require ('./list/item/resource-list-item.controller.js');
require ('./list/resource-list.component.js');
require ('./list/resource-list.controller.js');
require ('./resource.run.js');
require ('./update/resource-update.component.js');
require ('./update/resource-update.controller.js');
