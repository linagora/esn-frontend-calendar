(function(angular) {
  'use strict';

  angular.module('esn.calendar', [
    'AngularJstz',
    'angularMoment',
    'esn.mailto-handler',
    'esn.aggregator',
    'esn.authentication',
    'esn.avatar',
    'esn.cache',
    'esn.calMoment',
    'esn.configuration',
    'esn.core',
    'esn.form.helper',
    'esn.header',
    'esn.highlight',
    'esn.i18n',
    'esn.ical',
    'esn.lodash-wrapper',
    'esn.media.query',
    'esn.module-registry',
    'esn.notification',
    'esn.provider',
    'esn.router',
    'esn.search',
    'esn.session',
    'esn.settings-overlay',
    'esn.clipboard',
    'esn.user-configuration',
    'esn.widget.helper',
    'linagora.esn.graceperiod',
    'linagora.esn.resource',
    'materialAdmin',
    'mgcrea.ngStrap.aside',
    'mgcrea.ngStrap.datepicker',
    'mgcrea.ngStrap.modal',
    'naturalSort',
    'ng.deviceDetector',
    'ngPromiseExtras',
    'ngTouch',
    'op.dynamicDirective',
    'pascalprecht.translate',
    'restangular',
    'material.components.tooltip',
    'material.components.radioButton',
    'uuid4',
    'esn.onscroll',
    'esn.datetime'
  ]);
})(angular);

require('esn-frontend-common-libs/src/frontend/js/modules/esn.router.js');
require('esn-frontend-common-libs/src/frontend/js/modules/notification.js');
require('esn-frontend-common-libs/src/frontend/js/modules/user/user.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/media-query.js');
require('esn-frontend-common-libs/src/frontend/js/modules/i18n/i18n.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/session.js');
require('esn-frontend-common-libs/src/frontend/js/modules/scroll.js');
require('esn-frontend-common-libs/src/frontend/js/modules/core.js');
require('esn-frontend-common-libs/src/frontend/js/modules/datetime/datetime.module.js');
require('esn-frontend-common-libs/src/frontend/components/openpaas-logo/openpaas-logo.js');
require('esn-frontend-common-libs/src/modules/linagora.esn.graceperiod/frontend/js/app.js');
require('esn-frontend-common-libs/src/frontend/js/modules/avatar.js');
require('esn-frontend-common-libs/src/frontend/js/modules/application-menu.js');
require('esn-frontend-common-libs/src/frontend/js/modules/form-helper/form-helper.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/search/search.module.js');
require('esn-frontend-common-libs/src/frontend/js/constants.js');
require('esn-frontend-common-libs/src/frontend/js/modules/search/search.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/cache.js');
require('esn-frontend-common-libs/src/frontend/js/modules/user/user.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/member.js');
require('esn-frontend-common-libs/src/frontend/js/modules/user-configuration/user-configuration.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/attendee/attendee.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/config/config.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/session');
require('esn-frontend-common-libs/src/frontend/js/modules/http.js');
require('esn-frontend-common-libs/src/frontend/js/modules/localstorage.js');
require('esn-frontend-common-libs/src/frontend/js/modules/datetime/datetime.module.js');
require('esn-frontend-common-libs/src/frontend/js/modules/media-query.js');
require('esn-frontend-common-libs/src/frontend/js/modules/escape-html.js');
require('esn-frontend-common-libs/src/frontend/components/angular-jstz/angular-jstz.js');
require('esn-frontend-common-libs/src/frontend/js/modules/websocket.js');
require('esn-frontend-common-libs/src/frontend/js/modules/touchscreen-detector.js');
require('esn-frontend-common-libs/src/frontend/js/modules/async-action.js');

require ('./calendar-configuration/calendar-configuration-header/calendar-configuration-header.directive.js');
require ('./calendar-configuration/calendar-configuration-tab-delegation/calendar-configuration-tab-delegation.component.js');
require ('./calendar-configuration/calendar-configuration-tab-delegation/calendar-configuration-tab-delegation.controller.js');
require ('./calendar-configuration/calendar-configuration-tab-main/calendar-configuration-tab-main.component.js');
require ('./calendar-configuration/calendar-configuration-tab-main/calendar-configuration-tab-main.controller.js');
require ('./calendar-configuration/calendar-configuration-tabs/calendar-configuration-tabs.component.js');
require ('./calendar-configuration/calendar-configuration-tabs/calendar-configuration-tabs.controller.js');
require ('./calendar-configuration/calendar-configuration.component.js');
require ('./calendar-configuration/calendar-configuration.controller.js');
require ('./calendar-root/calendar-root.controller.js');
require ('./calendar-shared-configuration/calendar-shared-configuration.component.js');
require ('./calendar-shared-configuration/calendar-shared-configuration.controller.js');
require ('./calendar-shared-configuration/item/calendar-shared-configuration-item.component.js');
require ('./calendar/calendar-header/calendar-sub-header.controller.js');
require ('./calendar/calendar-header/calendar-sub-header.directive.js');
require ('./calendar/calendar-view/calendar-view.controller.js');
require ('./calendar/calendar-view/calendar-view.directive.js');
require ('./calendar/calendar.component.js');
require ('./calendar/calendar.controller.js');
require ('./components/attendee-tabs/attendee-tabs.component.js');
require ('./components/attendee/attendee-item-consult/attendee-item-consult.component.js');
require ('./components/attendee/attendee-item-consult/attendee-item-consult.controller.js');
require ('./components/attendee/attendee-item/attendee-item.component.js');
require ('./components/attendee/attendee-item/attendee-item.controller.js');
require ('./components/attendee/list/attendee-list.component.js');
require ('./components/attendee/list/attendee-list.controller.js');
require ('./components/avatar/attendee-avatar/attendee-avatar.component.js');
require ('./components/avatar/attendee-avatar/attendee-avatar.controller.js');
require ('./components/avatar/attendee-avatar/external/attendee-avatar-external.component.js');
require ('./components/avatar/attendee-avatar/external/attendee-avatar-external.controller.js');
require ('./components/avatar/resource-avatar/resource-avatar.component.js');
require ('./components/avatar/resource-avatar/resource-avatar.controller.js');
require ('./components/calendar-color-picker/calendar-color-picker.js');
require ('./components/calendar-config-form/calendar-config-form.component.js');
require ('./components/calendar-icon/calendar-icon.component.js');
require ('./components/calendar-today-button/calendar-today-button.component.js');
require ('./components/calendar-today-button/calendar-today-button.controller.js');
require ('./components/calendar/calendar.component.js');
require ('./components/calendar/calendar.controller.js');
require ('./components/calendars-list/calendars-list.component.js');
require ('./components/calendars-list/calendars-list.controller.js');
require ('./components/calendars-list/external/external-calendars-list.component.js');
require ('./components/calendars-list/items/calendars-list-items.component.js');
require ('./components/calendars-list/items/calendars-list-items.controller.js');
require ('./components/calendars-list/items/item/calendars-list-item.component.js');
require ('./components/calendars-list/items/item/calendars-list-item.controller.js');
require ('./components/calendars-list/items/item/configuration/calendars-list-item-configuration.component.js');
require ('./components/calendars-list/items/item/configuration/calendars-list-item-configuration.controller.js');
require ('./components/calendars-list/user/user-calendars-list.component.js');
require ('./components/entities-autocomplete-input/entities-autocomplete-input.component.js');
require ('./components/entities-autocomplete-input/entities-autocomplete-input.controller.js');
require ('./components/event-alarm-consultation/event-alarm-consultation.component.js');
require ('./components/event-alarm-consultation/event-alarm-consultation.controller.js');
require ('./components/event-alarm-edition/event-alarm-edition.component.js');
require ('./components/event-alarm-edition/event-alarm-edition.controller.js');
require ('./components/event-create-button/event-create-button.component.js');
require ('./components/event-create-button/event-create-button.controller.js');
require ('./components/event-date-consultation/event-date-consultation.component.js');
require ('./components/event-date-consultation/event-date-consultation.controller.js');
require ('./components/event-date-edition/event-date-edition.component.js');
require ('./components/event-date-edition/event-date-edition.controller.js');
require ('./components/event-date-suggestion/event-date-suggestion.component.js');
require ('./components/event-date-suggestion/event-date-suggestion.controller.js');
require ('./components/event-date-suggestion/modal/event-date-suggestion-modal.service.js');
require ('./components/event-date-suggestion/summary/event-date-suggestion-summary.component.js');
require ('./components/event-participation/event-participation.component.js');
require ('./components/event-recurrence-edition/event-recurrence-edition.js');
require ('./components/inbox/inbox.constants.js');
require ('./components/inbox/invitation-message-blue-bar/invitation-message-blue-bar.component.js');
require ('./components/inbox/invitation-message-blue-bar/invitation-message-blue-bar.controller.js');
require ('./components/inbox/invitation-message-blue-bar/invitation-message-blue-bar.run.js');
require ('./components/inbox/invitation-message-indicator/invitation-message-indicator.js');
require ('./components/inbox/invitation-message-indicator/invitation-message-indicator.run.js');
require ('./components/inbox/resource-management-blue-bar/resource-management-blue-bar.component.js');
require ('./components/inbox/resource-management-blue-bar/resource-management-blue-bar.controller.js');
require ('./components/inbox/resource-management-blue-bar/resource-management-blue-bar.run.js');
require ('./components/inbox/resource-management-indicator/resource-management-indicator.js');
require ('./components/inbox/resource-management-indicator/resource-management-indicator.run.js');
require ('./components/mail-to-attendees/mail-to-attendees.component.js');
require ('./components/mail-to-attendees/mail-to-attendees.controller.js');
require ('./components/manage-left-menu/manage-left-menu.component.js');
require ('./components/mini-calendar/mini-calendar-eventsource-builder.service.js');
require ('./components/mini-calendar/mini-calendar-mobile.directive.js');
require ('./components/mini-calendar/mini-calendar.controller.js');
require ('./components/mini-calendar/mini-calendar.directive.js');
require ('./components/mini-calendar/mini-calendar.service.js');
require ('./components/modals/calendar-delete-confirmation/calendar-delete-confirmation-modal.service.js');
require ('./components/partstat-buttons/partstat-buttons.component.js');
require ('./components/partstat-buttons/partstat-buttons.controller.js');
require ('./components/partstat/icon/partstat-icon.component.js');
require ('./components/partstat/icon/partstat-icon.controller.js');
require ('./components/rights/shared/calendar-shared-rights-display.component.js');
require ('./components/rights/shared/calendar-shared-rights-display.controller.js');
require ('./components/select-calendar/select-calendar-item.component.js');
require ('./components/select-calendar/select-calendar-item.controller.js');
require ('./components/show-planning-sidebar-button/show-planning-sidebar-button.component.js');
require ('./components/show-planning-sidebar-button/show-planning-sidebar-button.controller.js');
require ('./config.js');
require ('./constants.js');
require ('./core/application-menu-calendar.directive.js');
require ('./core/auto-size-and-update.directive.js');
require ('./core/calendar-date-indicator.directive.js');
require ('./core/calendar-view-translation.directive.js');
require ('./core/date-to-moment.directive.js');
require ('./core/friendlify-end-date.directive.js');
require ('./core/partstat.filter.js');
require ('./core/toggle-calendar-today.directive.js');
require ('./core/toggle-calendar-view.directive.js');
require ('./core/toggle-mini-calendar.directive.js');
require ('./event-message/event-message-edition-button/event-message-edition-button.directive.js');
require ('./event-message/event-message-edition/event-message-edition.component.js');
require ('./event-message/event-message-edition/event-message-edition.controller.js');
require ('./event-message/event-message.directive.js');
require ('./event-message/event-message.service.js');
require ('./event-view/event-view.component.js');
require ('./event-view/event-view.controller.js');
require ('./event-view/external-user/event-view-external-user.component.js');
require ('./event-view/external-user/event-view-external-user.controller.js');
require ('./event-view/internal-user/event-view-internal-user.component.js');
require ('./event-view/internal-user/event-view-internal-user.controller.js');
require ('./event/form/event-form.controller.js');
require ('./event/form/event-form.directive.js');
require ('./event/form/open/event-form.service.js');
require ('./event/form/open/open-event-form-on-click.component.js');
require ('./event/form/open/open-event-form.service.js');
require ('./event/form/open/open-event-from-search-form.service.js');
require ('./freebusy/confirmation-modal/event-freebusy-confirmation-modal.service.js');
require ('./freebusy/event-freebusy-hooks.service.js');
require ('./freebusy/freebusy-api.service.js');
require ('./freebusy/freebusy.constants.js');
require ('./freebusy/freebusy.service.js');
require ('./freebusy/icon/event-freebusy-icon.component.js');
require ('./freebusy/icon/event-freebusy-icon.controller.js');
require ('./module-registry.run.js');
require ('./planning/aside/calendar-planning-aside.directive.js');
require ('./planning/calendar-planning.component.js');
require ('./planning/calendar-planning.controller.js');
require ('./resource/resource-item/resource-item.component.js');
require ('./resource/resource-item/resource-item.controller.js');
require ('./resource/resource-list/resource-list.component.js');
require ('./resource/resource-list/resource-list.controller.js');
require ('./routes.js');
require ('./run.js');
require ('./search/event/event-search-card.component.js');
require ('./search/event/event-search-provider.service.js');
require ('./search/form/dropdown/calendar-options/calendar-search-form-dropdown-calendar-options.component.js');
require ('./search/form/dropdown/calendar-search-form-dropdown.component.js');
require ('./search/form/dropdown/calendar-search-from-dropdown.controller.js');
require ('./search/form/search-form.component.js');
require ('./search/form/search-form.controller.js');
require ('./search/search.run.js');
require ('./services/attendee.service.js');
require ('./services/attendees-cache.service.js');
require ('./services/attendees-denormalizer.service.js');
require ('./services/cached-event-source.js');
require ('./services/cal-default-value.service.js');
require ('./services/cal-ui-authorization-service.js');
require ('./services/caldav-url.service.js');
require ('./services/calendar-api.js');
require ('./services/calendar-attendee-service.js');
require ('./services/calendar-business-hours.service.js');
require ('./services/calendar-cache.js');
require ('./services/calendar-configuration.service.js');
require ('./services/calendar-current-view.js');
require ('./services/calendar-event-emitter.js');
require ('./services/calendar-event-source-builder.js');
require ('./services/calendar-event-source.js');
require ('./services/calendar-explored-period-service.js');
require ('./services/calendar-home-service.js');
require ('./services/calendar-resource-restangular.js');
require ('./services/calendar-resource.service.js');
require ('./services/calendar-restangular.js');
require ('./services/calendar-right-comparator.js');
require ('./services/calendar-rights-utils.js');
require ('./services/calendar-service.js');
require ('./services/calendar-subscription-api.service.js');
require ('./services/calendar-users-cache.js');
require ('./services/calendar-utils.js');
require ('./services/calendar-visibility-service.js');
require ('./services/dav-request.js');
require ('./services/delegation-edition-helper.js');
require ('./services/event-api.js');
require ('./services/event-service.js');
require ('./services/event-store.js');
require ('./services/event-utils.js');
require ('./services/fc-moment.js');
require ('./services/fullcalendar/calendar-configuration.service.js');
require ('./services/fullcalendar/planning-render-event.service.js');
require ('./services/fullcalendar/render-event.service.js');
require ('./services/grace-period-response-handler.js');
require ('./services/http-response-handler.js');
require ('./services/ical.js');
require ('./services/master-event-cache.js');
require ('./services/partstat-update-notification.service.js');
require ('./services/path-builder.js');
require ('./services/path-parser.service.js');
require ('./services/shells/calendar-collection-shell.js');
require ('./services/shells/calendar-right-shell.js');
require ('./services/shells/calendar-shell.js');
require ('./services/shells/rrule-shell.js');
require ('./services/shells/valarm-shell.js');
require ('./services/shells/vfreebusy-shell.js');
require ('./services/timezone.js');
require ('./services/user-and-external-calendars.service.js');
require ('./services/websocket/listener.run.js');
require ('./services/websocket/listener.service.js');
require ('./settings/calendars/fab/create-calendar-menu-item/create-calendar-menu-item.component.js');
require ('./settings/calendars/fab/create-calendar-menu-item/create-calendar-menu-item.run.js');
require ('./settings/calendars/fab/import-calendar-menu-item/import-calendar-menu-item.component.js');
require ('./settings/calendars/fab/import-calendar-menu-item/import-calendar-menu-item.run.js');
require ('./settings/calendars/fab/subscribe-calendar-menu-item/subscribe-calendar-menu-item.component.js');
require ('./settings/calendars/fab/subscribe-calendar-menu-item/subscribe-calendar-menu-item.run.js');
require ('./settings/calendars/item/settings-calendars-item.component.js');
require ('./settings/calendars/item/settings-calendars-item.controller.js');
require ('./settings/calendars/settings-calendars.component.js');
require ('./settings/calendars/settings-calendars.controller.js');
require ('./settings/display/settings-display.component.js');
require ('./settings/display/settings-display.controller.js');
require ('./settings/import/calendar-import.component.js');
require ('./settings/import/calendar-import.controller.js');
require ('./settings/settings.controller.js');
require ('./settings/sidebar-button/settings-sidebar-button.component.js');
require ('./settings/subheader/display/settings-display-subheader.component.js');
require ('./settings/subheader/settings-subheader.component.js');
require ('./sidebar/sidebar.directive.js');
require ('./sidebar/title/sidebar-title.component.js');
