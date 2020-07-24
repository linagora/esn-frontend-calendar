'use strict';

angular.module('esn.calendar.libs')
  .run(addTemplateCache);

function addTemplateCache($templateCache) {
  $templateCache.put('/calendar/app/components/entities-autocomplete-input/entities-autocomplete-input-tag.html', require('./components/entities-autocomplete-input/entities-autocomplete-input-tag.pug'));
}