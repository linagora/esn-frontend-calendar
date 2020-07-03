'use strict';

/* global chai, sinon, _: false */

var expect = chai.expect;

describe('The calEntitiesAutocompleteInputController', function() {

  var $rootScope, $scope, $controller, calendarAttendeeService, calendarHomeService, attendeeCandidates, session, calEventsProviders, CAL_AUTOCOMPLETE_MAX_RESULTS, CAL_ATTENDEE_OBJECT_TYPE;

  beforeEach(function() {
    session = {
      user: {
        _id: '123456',
        emails: ['user1@test.com'],
        emailMap: {'user1@test.com': true}
      },
      domain: {
        company_name: 'test',
        _id: 'domainId'
      },
      ready: {
        then: function() {
        }
      }
    };

    attendeeCandidates = [
      {
        email: 'user1@test.com',
        emails: ['user1@test.com'],
        id: '111111',
        firstname: 'first',
        lastname: 'last',
        partstat: 'NEEDS-ACTION',
        preferredEmail: 'user1@test.com'
      },
      {
        displayName: 'contact2',
        email: 'user2@test.com',
        emails: ['user2@test.com'],
        id: '222222',
        partstat: 'NEEDS-ACTION',
        preferredEmail: 'user2@test.com'
      },
      {
        displayName: 'contact3',
        email: 'user3@test.com',
        emails: ['user3@test.com'],
        firstname: 'john',
        id: '333333',
        lastname: 'doe',
        partstat: 'NEEDS-ACTION',
        preferredEmail: 'user3@test.com'
      },
      {
        displayName: 'contact4',
        email: 'user4@test.com',
        emails: ['user4@test.com'],
        id: '444444',
        partstat: 'NEEDS-ACTION',
        preferredEmail: 'user4@test.com'
      }
    ];

    calendarHomeService = {
      getUserCalendarHomeId: function() {
        return $q.when(session.user._id);
      }
    };

    calendarAttendeeService = {
      getAttendeeCandidates: function() {
        return $q.when(attendeeCandidates);
      }
    };

    calEventsProviders = function() {
      return {
        setUpSearchProvider: function() {
        }
      };
    };

    CAL_AUTOCOMPLETE_MAX_RESULTS = 6;

    angular.mock.module('esn.calendar', function($provide) {
      $provide.value('calendarAttendeeService', calendarAttendeeService);
      $provide.value('calendarHomeService', calendarHomeService);
      $provide.value('session', session);
      $provide.factory('calEventsProviders', calEventsProviders);
      $provide.constant('CAL_AUTOCOMPLETE_MAX_RESULTS', CAL_AUTOCOMPLETE_MAX_RESULTS);
    });
    angular.mock.inject(function(_$rootScope_, _$controller_, _calendarAttendeeService_, _session_, _CAL_AUTOCOMPLETE_MAX_RESULTS_, _CAL_ATTENDEE_OBJECT_TYPE_) {
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $controller = _$controller_;
      calendarAttendeeService = _calendarAttendeeService_;
      session = _session_;
      CAL_AUTOCOMPLETE_MAX_RESULTS = _CAL_AUTOCOMPLETE_MAX_RESULTS_;
      CAL_ATTENDEE_OBJECT_TYPE = _CAL_ATTENDEE_OBJECT_TYPE_;
    });
  });

  function initController(bindings) {
    return $controller('calEntitiesAutocompleteInputController', null, bindings);
  }

  it('should initialize the model, if none given', function() {
    var ctrl = initController();

    expect(ctrl.mutableEntities).to.deep.equal([]);
  });

  it('should use the model, if one given', function() {
    var bindings = { mutableEntities: [{ a: '1' }] };
    var ctrl = initController(bindings);

    expect(ctrl.mutableEntities).to.deep.equal([{a: '1'}]);
  });

  describe('getInvitableEntities', function() {
    var query = 'aQuery';
    var ctrl;
    var expectedEntitiesDuplication = [
      {
        displayName: 'contact3',
        email: 'user3@test.com',
        emails: ['user3@test.com'],
        firstname: 'john',
        id: '333333',
        lastname: 'doe',
        partstat: 'NEEDS-ACTION',
        preferredEmail: 'user3@test.com'
      },
      {
        displayName: 'contact4',
        email: 'user4@test.com',
        emails: ['user4@test.com'],
        id: '444444',
        partstat: 'NEEDS-ACTION',
        preferredEmail: 'user4@test.com'
      }
    ];

    var expectedEntitiesSorted = [
      {
        displayName: 'contact2',
        email: 'user2@test.com',
        emails: ['user2@test.com'],
        id: '222222',
        partstat: 'NEEDS-ACTION',
        preferredEmail: 'user2@test.com'
      },
      {
        displayName: 'contact3',
        email: 'user3@test.com',
        emails: ['user3@test.com'],
        firstname: 'john',
        id: '333333',
        lastname: 'doe',
        partstat: 'NEEDS-ACTION',
        preferredEmail: 'user3@test.com'
      },
      {
        displayName: 'contact4',
        email: 'user4@test.com',
        emails: ['user4@test.com'],
        id: '444444',
        partstat: 'NEEDS-ACTION',
        preferredEmail: 'user4@test.com'
      }
    ];

    describe('When excludeCurrentUser is falsy', function() {
      beforeEach(function() {
        ctrl = initController({excludeCurrentUser: false});
      });

      it('should call calendarAttendeeService, keep session.user and sort the users based on the displayName property ', function(done) {
        ctrl.getInvitableEntities(query).then(function(response) {
          expect(response).to.deep.equal(attendeeCandidates);

          done();
        });

        $scope.$digest();
      });
    });

    describe('When excludeCurrentUser is truethy', function() {
      beforeEach(function() {
        ctrl = initController({excludeCurrentUser: true});
      });

      it('should call calendarAttendeeService, remove session.user and sort the other users based on the displayName property ', function(done) {
        ctrl.getInvitableEntities(query).then(function(response) {
          expect(response).to.deep.equal(expectedEntitiesSorted);

          done();
        });

        $scope.$digest();
      });

      it('should remove duplicate entities, based on primary email, comparing to added already entities', function(done) {
        ctrl.originalEntities = [{ email: 'user2@test.com', emails: ['user2@test.com'] }];

        _checkDuplication(done);
      });

      it('should remove duplicate entities, based on secondary email, comparing to added already entities', function(done) {
        ctrl.originalEntities = [{ email: 'another@world.com', emails: ['another@world.com', 'user2@test.com'] }];

        _checkDuplication(done);
      });

      it('should remove duplicate entities, based on primary email, comparing to entities being currently added', function(done) {
        ctrl.mutableEntities = [{ email: 'user2@test.com', emails: ['user2@test.com'] }];

        _checkDuplication(done);
      });

      it('should remove duplicate entities, based on secondary email, comparing to entities being currently added', function(done) {
        ctrl.mutableEntities = [{ email: 'another@world.com', emails: ['another@world.com', 'user2@test.com'] }];

        _checkDuplication(done);
      });

      function _checkDuplication(done) {
        _getAndCheckInvitableEntities(ctrl, query, expectedEntitiesDuplication, done);
      }

      function _getAndCheckInvitableEntities(ctrl, query, expectedEntitiesDuplication, done) {
        ctrl.getInvitableEntities(query).then(function(response) {
          expect(response).to.deep.equal(expectedEntitiesDuplication);

          done();
        });

        $scope.$digest();
      }

      it('should call calendarAttendeeService and return a maximum of CAL_AUTOCOMPLETE_MAX_RESULTS results', function(done) {
        calendarAttendeeService.getAttendeeCandidates = function(q) {
          expect(q).to.equal(query);
          var response = [];

          for (var i = 0; i < 20; i++) {
            response.push({id: 'contact' + i, email: i + 'mail@domain.com', partstat: 'NEEDS-ACTION'});
          }

          return $q.when(response);
        };

        ctrl.getInvitableEntities(query).then(function(response) {
          expect(response.length).to.equal(CAL_AUTOCOMPLETE_MAX_RESULTS);

          done();
        });

        $scope.$digest();
      });

      it('should call the calendarAttendeeService with default types', function() {
        calendarAttendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([]));
        ctrl.getInvitableEntities();

        $scope.$digest();

        expect(calendarAttendeeService.getAttendeeCandidates).to.have.been.calledWith(sinon.match.any, sinon.match.any, [CAL_ATTENDEE_OBJECT_TYPE.user, CAL_ATTENDEE_OBJECT_TYPE.resource, CAL_ATTENDEE_OBJECT_TYPE.contact]);
      });

      it('should call the calendarAttendeeService with defined types', function() {
        var types = ['twitter', 'facebook', 'github'];

        ctrl = initController({types: types});
        calendarAttendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([]));
        ctrl.getInvitableEntities();

        $scope.$digest();

        expect(calendarAttendeeService.getAttendeeCandidates).to.have.been.calledWith(sinon.match.any, sinon.match.any, types);
      });

      it('should filter out entities which does not have email', function(done) {
        var attendees = [1, 2, 3].map(function(i) {
          return {id: 'contact' + i, email: i + 'mail@domain.com', partstat: 'NEEDS-ACTION'};
        });

        attendees.push({id: 'noemail'});

        calendarAttendeeService.getAttendeeCandidates = sinon.stub().returns($q.when(attendees));

        ctrl.getInvitableEntities(query).then(function(response) {
          expect(response.length).to.equal(attendees.length - 1);
          expect(_.find(response, {id: 'noemail'})).to.be.falsy;

          done();
        });

        $scope.$digest();
      });
    });
  });

  describe('onAddingEntity', function() {
    it('should return true with entity having an email', function() {
      var entity, response;
      var ctrl = initController();

      entity = { id: 1, displayName: 'yolo', email: 'yolo@open-paas.org' };
      response = ctrl.onAddingEntity(entity);

      expect(response).to.be.true;
    });

    it('should return false with entity without an email', function() {
      var entity, response;
      var ctrl = initController();

      entity = {displayName: 'eric cartman'};
      response = ctrl.onAddingEntity(entity);

      expect(response).to.be.false;
    });

    it('should return false when entity email is not an email', function() {
      var entity, response;
      var ctrl = initController();

      entity = {displayName: 'eric cartman', email: 'this is not an email'};
      response = ctrl.onAddingEntity(entity);

      expect(response).to.be.false;
    });

    describe('excluding unknown users', function() {
      it('should return false if added entity is not an OP user', function() {
        var displayName = 'plain@email.com';
        var entity = { displayName: displayName };
        var ctrl = initController({ excludeUnknownUsers: true });

        expect(ctrl.onAddingEntity(entity)).to.be.falsy;
      });

      it('should return true if added entity is an OP user', function() {
        var displayName = 'plain@email.com';
        var entity = { displayName: displayName, objectType: 'user' };
        var ctrl = initController({ excludeUnknownUsers: true });

        expect(ctrl.onAddingEntity(entity)).to.be.true;
      });
    });

    describe('adding plain email entity', function() {
      it('should use displayName as ID and email', function() {
        var displayName = 'plain@email.com';
        var entity = { displayName: displayName };
        var ctrl = initController();

        ctrl.onAddingEntity(entity);
        expect(entity).to.deep.equal({
          displayName: displayName,
          id: displayName,
          email: displayName
        });
      });

      it('should return false when trying to add duplicate contact as entities', function() {
        var duplicateContact = {
          id: '1',
          email: 'duplicate@email.com'
        };
        var ctrl = initController();

        ctrl.originalEntities = [duplicateContact];

        expect(ctrl.onAddingEntity(duplicateContact)).to.be.false;
      });

      it('should return false when adding contact with existent id as entity', function() {
        var duplicateContact = {
          id: '1'
        };
        var ctrl = initController();

        ctrl.originalEntities = [duplicateContact];

        expect(ctrl.onAddingEntity(duplicateContact)).to.be.false;
      });

      it('should return false when adding contact with existent email as entity', function() {
        var duplicateContact = {
          email: 'duplicate@email.com'
        };
        var ctrl = initController();

        ctrl.originalEntities = [duplicateContact];

        expect(ctrl.onAddingEntity(duplicateContact)).to.be.false;
      });
    });
  });

});
