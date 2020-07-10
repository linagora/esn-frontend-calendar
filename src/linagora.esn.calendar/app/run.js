(function() {
  'use strict';

  angular.module('esn.calendar')
    .run(registerTimezones)
    .run(addTemplateCache);

  function registerTimezones(calRegisterTimezones) {
    calRegisterTimezones();
  }

  function addTemplateCache($templateCache) {
    $templateCache.put('/calendar/app/search/event/event-search-item.html', require('./search/event/event-search-item.pug'));
    $templateCache.put('/calendar/app/search/form/search-form-template.html', require('./search/form/search-form-template.pug'));
    $templateCache.put('/calendar/app/components/entities-autocomplete-input/entities-autocomplete-input-tag.html', require('./components/entities-autocomplete-input/entities-autocomplete-input-tag.pug'));
    $templateCache.put('/calendar/app/planning/aside/calendar-planning-for-aside.html', require('./planning/aside/calendar-planning-for-aside.pug'));
    $templateCache.put('/calendar/app/sidebar/mobile/sidebar-mobile.html', require('./sidebar/mobile/sidebar-mobile.pug'));
  }
})();
