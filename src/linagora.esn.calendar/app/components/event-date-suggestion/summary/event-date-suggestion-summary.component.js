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

  function calEventDateSuggestionSummaryCtrl() {
    var self = this;
    self.translationData = {
      recurrenceType: self.event.getRecurrenceType()
    };
  }
