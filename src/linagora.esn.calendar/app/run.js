'use strict';

angular.module('esn.calendar')
  .run(addTemplateCache);

function addTemplateCache($templateCache) {
  $templateCache.put('/calendar/app/search/event/event-search-item.html', require('./search/event/event-search-item.pug'));
  $templateCache.put('/calendar/app/search/form/search-form-template.html', require('./search/form/search-form-template.pug'));
  $templateCache.put('/calendar/app/planning/aside/calendar-planning-for-aside.html', require('./planning/aside/calendar-planning-for-aside.pug'));
  $templateCache.put('/calendar/app/sidebar/mobile/sidebar-mobile.html', require('./sidebar/mobile/sidebar-mobile.pug'));
  $templateCache.put('/calendar/app/settings/import/calendar-import.html', require('./settings/import/calendar-import.pug'));
  $templateCache.put('/calendar/app/calendar-shared-configuration/calendar-shared-configuration.html', require('./calendar-shared-configuration/calendar-shared-configuration.pug'));
}
