'use strict';

angular.module('esn.calendar.libs')
  .component('calEntitiesAutocompleteInput', {
    template: require("./entities-autocomplete-input.pug"),
    bindings: {
      excludeCurrentUser: '=?', // defaults to false
      originalEntities: '=?',
      mutableEntities: '=',
      excludeUnknownUsers: '=?',
      onEntityAdded: '=?',
      onEntityRemoved: '=?',
      onAddingEntity: '=?',
      addFromAutocompleteOnly: '=?',
      showIcon: '=?',
      placeHolder: '@?',
      showResourceIcon: '=?',
      types: '=?',
      inputType: '@?',
      template: '@?'
    },
    controller: 'calEntitiesAutocompleteInputController',
    controllerAs: 'ctrl'
  });
