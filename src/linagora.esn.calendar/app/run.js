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
  }
})();
