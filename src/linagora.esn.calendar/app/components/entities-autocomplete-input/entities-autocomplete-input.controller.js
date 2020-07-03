(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('calEntitiesAutocompleteInputController', calEntitiesAutocompleteInputController);

  function calEntitiesAutocompleteInputController(
    _,
    emailService,
    naturalService,
    session,
    calendarAttendeeService,
    CAL_ATTENDEE_OBJECT_TYPE,
    CAL_AUTOCOMPLETE_MAX_RESULTS,
    CAL_AUTOCOMPLETE_DEFAULT_PLACEHOLDER
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.mutableEntities = self.mutableEntities || [];
    self.originalEntities = self.originalEntities || [];
    self.placeHolder = self.placeHolder || CAL_AUTOCOMPLETE_DEFAULT_PLACEHOLDER;
    self.showIcon = self.showIcon || false;
    self.onAddingEntity = self.onAddingEntity || _onAddingEntity;
    self.getInvitableEntities = getInvitableEntities;
    self.defaultTypes = [CAL_ATTENDEE_OBJECT_TYPE.user, CAL_ATTENDEE_OBJECT_TYPE.resource, CAL_ATTENDEE_OBJECT_TYPE.contact];

    ////////////

    function $onInit() {
      self.excludeCurrentUser = !!self.excludeCurrentUser;
      self.excludeUnknownUsers = !!self.excludeUnknownUsers;
    }

    function _onAddingEntity(entity) {
      if (!entity.id) {
        entity.id = entity.displayName;
        entity.email = entity.displayName;
      } else {
        entity._id = entity.id;
      }

      if (self.excludeUnknownUsers && !entity.objectType) {
        return false;
      }

      return emailService.isValidEmail(entity.email) && !_isDuplicateEntity(entity, _getAddedEntitiesEmails());
    }

    function getInvitableEntities(query) {
      self.query = query;
      var types = self.types ? self.types : self.defaultTypes;

      return calendarAttendeeService.getAttendeeCandidates(query, CAL_AUTOCOMPLETE_MAX_RESULTS * 2, types).then(function(entityCandidates) {
        entityCandidates = filterCandidates(entityCandidates);
        entityCandidates.sort(function(a, b) {
          return naturalService.naturalSort(a.displayName, b.displayName);
        });

        return entityCandidates.slice(0, CAL_AUTOCOMPLETE_MAX_RESULTS);
      });
    }

    function filterCandidates(entities) {
      var addedEntitiesEmails = _getAddedEntitiesEmails();

      var filterDupes = entities.filter(function(entity) {
        return !_isDuplicateEntity(entity, addedEntitiesEmails) && !_excludeCurrentUser(entity);
      });

      return filterDupes.filter(_.property('email'));
    }

    function _excludeCurrentUser(entity) {
      return self.excludeCurrentUser && (entity.email in session.user.emailMap);
    }

    function _getAddedEntitiesEmails() {
      var addedEntities = self.mutableEntities.concat(self.originalEntities);
      var addedEntitiesEmails = [];

      addedEntities.forEach(function(entity) {
        if (entity.emails) {
          entity.emails.forEach(function(email) {
            addedEntitiesEmails.push(email);
          });
        } else {
          addedEntitiesEmails.push(entity.email);
        }
      });

      return addedEntitiesEmails;
    }

    function _isDuplicateEntity(entity, addedEntitiesEmails) {
      //return (entity.email in session.user.emailMap) || addedEntitiesEmails.indexOf(entity.email) > -1;
      return addedEntitiesEmails.indexOf(entity.email) > -1;
    }
  }

})();
