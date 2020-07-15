'use strict';

angular.module('esn.calendar')
  .component('calEventDateSuggestionSummary', {
    template: require("./event-date-suggestion-summary.pug"),
    bindings: {
      event: '<',
      user: '<'
    },
    controller: calEventDateSuggestionSummaryCtrl,
    controllerAs: '$ctrl'
  });

  function calEventDateSuggestionSummaryCtrl(watchDynamicTranslatedValue) {
    var self = this;
    self.translationData = {};
    watchDynamicTranslatedValue(self.translationData, 'recurrenceType', function() {
      return self.event.getRecurrenceType();
    });
  }
