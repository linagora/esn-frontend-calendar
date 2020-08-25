'use strict';

angular.module('esn.calendar.libs')
  .run(registerTimezones)
  .run(addTemplateCache);

function registerTimezones(calRegisterTimezones) {
  calRegisterTimezones();
}

function addTemplateCache($templateCache) {
  $templateCache.put('/calendar/app/components/entities-autocomplete-input/entities-autocomplete-input-tag.html', require('./components/entities-autocomplete-input/entities-autocomplete-input-tag.pug'));
}
