'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calAttendeeService service', function() {
  var $rootScope, $log, $q, CAL_ICAL, calAttendeeService, calAttendeesCache, calResourceService, userUtils;

  beforeEach(function() {
    userUtils = {
      displayNameOf: sinon.stub()
    };
    calResourceService = {
      getResource: sinon.spy(function(id) {
        return $q.when({ _id: id, deleted: true });
      })
    };
    calAttendeesCache = {
      get: sinon.stub()
    };
  });

  beforeEach(function() {
    angular.mock.module('esn.calendar');

    angular.mock.module(function($provide) {
      $provide.value('userUtils', userUtils);
      $provide.value('calResourceService', calResourceService);
      $provide.value('calAttendeesCache', calAttendeesCache);
    });

    angular.mock.inject(function(_$rootScope_, _$log_, _$q_, _CAL_ICAL_, _calAttendeeService_) {
      $rootScope = _$rootScope_;
      $log = _$log_;
      $q = _$q_;
      CAL_ICAL = _CAL_ICAL_;
      calAttendeeService = _calAttendeeService_;
    });
  });

  describe('The splitAttendeesFromTypefunction', function() {
    it('should return empty arrays when attendees is not defined', function() {
      expect(calAttendeeService.splitAttendeesFromType()).to.deep.equals({
          users: [],
          resources: []
      });
    });

    it('should return empty arrays when attendees is empty', function() {
      expect(calAttendeeService.splitAttendeesFromType([])).to.deep.equals({
          users: [],
          resources: []
        });
    });

    it('should set attendee without cutype as user', function() {
      var attendee = { _id: 1 };

      expect(calAttendeeService.splitAttendeesFromType([attendee])).to.deep.equals({
          users: [attendee],
          resources: []
        });
    });

    it('should set attendees in correct category', function() {
      var userAttendee = { _id: 1, cutype: CAL_ICAL.cutype.individual };
      var resourceAttendee = { _id: 1, cutype: CAL_ICAL.cutype.resource };

      expect(calAttendeeService.splitAttendeesFromType([userAttendee, resourceAttendee])).to.deep.equals({
          users: [userAttendee],
          resources: [resourceAttendee]
        });
    });
  });

  describe('The splitAttendeesFromTypeWithResourceDetails function', function() {
    it('should return empty arrays when attendees is not defined', function(done) {
      calAttendeeService.splitAttendeesFromTypeWithResourceDetails().then(function(result) {
        expect(result).to.deep.equals({
          users: [],
          resources: []
        });

        done();
      }, done);

      $rootScope.$digest();
    });

    it('should return empty arrays when attendees is empty', function(done) {
      calAttendeeService.splitAttendeesFromTypeWithResourceDetails([]).then(function(result) {
        expect(result).to.deep.equals({
          users: [],
          resources: []
        });
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should set attendee without cutype as user', function(done) {
      var attendee = { _id: 1 };

      calAttendeeService.splitAttendeesFromTypeWithResourceDetails([attendee]).then(function(result) {
        expect(result).to.deep.equals({
          users: [attendee],
          resources: []
        });
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should set attendees in correct category', function(done) {
      var userAttendee = { _id: 1, cutype: CAL_ICAL.cutype.individual };
      var resourceAttendee = { _id: 1, cutype: CAL_ICAL.cutype.resource };

      calAttendeeService.splitAttendeesFromTypeWithResourceDetails([userAttendee, resourceAttendee]).then(function(result) {
        expect(result).to.deep.equals({
          users: [userAttendee],
          resources: [resourceAttendee]
        });
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should request complementary resource data', function(done) {
      var resourceAttendee = { _id: 1, cutype: CAL_ICAL.cutype.resource, email: '1@1.1'};
      var resourceAttendeeExpected = { _id: 1, cutype: CAL_ICAL.cutype.resource, email: '1@1.1', deleted: true };

      calAttendeeService.splitAttendeesFromTypeWithResourceDetails([resourceAttendee]).then(function(result) {
        expect(calResourceService.getResource).to.have.been.called;
        expect(result).to.deep.equals({
          users: [],
          resources: [resourceAttendeeExpected]
        });
        done();
      }, done);

      $rootScope.$digest();
    });
  });

  describe('The getAttendeeForUser function', function() {
    var user;

    beforeEach(function() {
      user = {_id: 1, emails: ['user1@open-paas.org'], emailMap: {'user1@open-paas.org': true}};
    });

    it('should return undefined when user is not defined', function() {
      expect(calAttendeeService.getAttendeeForUser([])).to.be.undefined;
    });

    it('should return undefined when attendees is not defined', function() {
      expect(calAttendeeService.getAttendeeForUser(null, user)).to.be.undefined;
    });

    it('should return undefined when attendees is empty', function() {
      expect(calAttendeeService.getAttendeeForUser([], user)).to.be.undefined;
    });

    it('should return undefined when user is not in attendee', function() {
      var attendees = [{ email: 'user2@open-paas.org' }];

      expect(calAttendeeService.getAttendeeForUser(attendees, user)).to.be.undefined;
    });

    it('should send back the attendee', function() {
      var attendees = [{ email: 'user2@open-paas.org' }, { email: 'user1@open-paas.org'}];

      expect(calAttendeeService.getAttendeeForUser(attendees, user)).to.deep.equals(attendees[1]);
    });
  });

  describe('The filterDuplicates function', function() {
    it('should keep original values', function() {
      var attendees = [{email: 'user1@open-paas.org'}, {email: 'user2@open-paas.org'}];

      expect(calAttendeeService.filterDuplicates(attendees)).to.deep.equals(attendees);
    });

    it('should keep attendees with partstat when duplicates 1', function() {
      var attendees = [{email: 'user1@open-paas.org'}, {email: 'user2@open-paas.org', partstat: 'needs-action'}, {email: 'user2@open-paas.org'}];

      expect(calAttendeeService.filterDuplicates(attendees)).to.deep.equals([attendees[0], attendees[1]]);
    });

    it('should keep attendees with partstat when duplicates 2', function() {
      var attendees = [{email: 'user1@open-paas.org'}, {email: 'user2@open-paas.org'}, {email: 'user2@open-paas.org', partstat: 'needs-action'}];

      expect(calAttendeeService.filterDuplicates(attendees)).to.deep.equals([attendees[0], attendees[2]]);
    });
  });

  describe('The manageResourceDetailsPromiseResolutions function', function() {
    it('should log rejected promise as error', function(done) {
      var resourcesFromDbPromises = [
        { state: 'fulfilled', value: { _id: 1, cutype: CAL_ICAL.cutype.resource, email: '1@1.1' }},
        { state: 'rejected', reason: { _id: 2, error: { message: 'could not find resource', code: 404 }}},
        { state: 'fulfilled', value: { _id: 3, cutype: CAL_ICAL.cutype.resource, email: '3@3.3' }}
      ];
      var logSpy = sinon.spy($log, 'error');

      calAttendeeService.manageResourceDetailsPromiseResolutions(resourcesFromDbPromises).then(function() {
        expect(logSpy).to.have.been.calledOnce;
        expect(logSpy).to.have.been.calledWith(sinon.match.string, { _id: 2, error: { message: 'could not find resource', code: 404 }});

        done();
      }, done);

      $rootScope.$digest();
    });

    it('should returned only fulfilled promise value', function(done) {
      var resourcesFromDbPromises = [
        { state: 'fulfilled', value: { _id: 1, cutype: CAL_ICAL.cutype.resource, email: '1@1.1' }},
        { state: 'rejected', reason: { _id: 2, error: { message: 'could not find resource', code: 404 }}},
        { state: 'fulfilled', value: { _id: 3, cutype: CAL_ICAL.cutype.resource, email: '3@3.3' }}
      ];

      calAttendeeService.manageResourceDetailsPromiseResolutions(resourcesFromDbPromises).then(function(result) {
        expect(result).to.deep.equals([
          { _id: 1, cutype: CAL_ICAL.cutype.resource, email: '1@1.1'},
          { _id: 3, cutype: CAL_ICAL.cutype.resource, email: '3@3.3'}
        ]);

        done();
      }, done);

      $rootScope.$digest();
    });

    it('should return a reject promise when there is no fulfilled promise', function(done) {
      var resourcesFromDbPromises = [
        { state: 'rejected', reason: { _id: 1, error: { message: 'could not find resource', code: 404 }}},
        { state: 'rejected', reason: { _id: 2, error: { message: 'could not find resource', code: 404 }}},
        { state: 'rejected', reason: { _id: 3, error: { message: 'could not find resource', code: 404 }}}
      ];

      calAttendeeService.manageResourceDetailsPromiseResolutions(resourcesFromDbPromises).catch(function(error) {
        expect(error).to.deep.equals([
          { _id: 1, error: { message: 'could not find resource', code: 404 }},
          { _id: 2, error: { message: 'could not find resource', code: 404 }},
          { _id: 3, error: { message: 'could not find resource', code: 404 }}
        ]);

        done();
      }, done);

      $rootScope.$digest();
    });

    it('should not reject when there is no fulfilled nor resolved promise', function(done) {
      var resourcesFromDbPromises = [];

      calAttendeeService.manageResourceDetailsPromiseResolutions(resourcesFromDbPromises).then(function(result) {
        expect(result).to.deep.equal([]);
        done();
      }).catch(done);

      $rootScope.$digest();
    });
  });

  describe('The logResourceDetailsError function', function() {
    it('should log error given', function() {
      var error = { message: 'could not find resource', code: 404 };
      var logSpy = sinon.spy($log, 'error');

      calAttendeeService.logResourceDetailsError(error);

      expect(logSpy).to.have.been.calledOnce;
      expect(logSpy).to.have.been.calledWith(sinon.match.string, error);
    });
  });

  describe('The getUserDisplayNameForAttendee function', function() {
    var attendee;

    beforeEach(function() {
      attendee = {
        email: 'user1@open-paas.org',
        name: 'The name',
        displayName: 'The display name'
      };
    });

    it('should return the attendee name from attendee if user is not found', function(done) {
      calAttendeesCache.get.returns($q.when());

      calAttendeeService.getUserDisplayNameForAttendee(attendee).then(function(result) {
        expect(calAttendeesCache.get).to.have.been.calledWith(attendee.email);
        expect(userUtils.displayNameOf).to.not.have.been.called;
        expect(result).to.equals(attendee.displayName);

        done();
      }).catch(done);

      $rootScope.$digest();
    });

    it('should return the attendee name from attendee if user name can not be generated from user', function(done) {
      var user = { _id: 1 };

      calAttendeesCache.get.returns($q.when(user));
      userUtils.displayNameOf.returns();

      calAttendeeService.getUserDisplayNameForAttendee(attendee).then(function(result) {
        expect(calAttendeesCache.get).to.have.been.calledWith(attendee.email);
        expect(userUtils.displayNameOf).to.have.been.calledWith(user);
        expect(result).to.equals(attendee.displayName);

        done();
      }).catch(done);

      $rootScope.$digest();
    });

    it('should return the attendee name from attendee if user resolution fails', function(done) {
      calAttendeesCache.get.returns($q.reject(new Error('I failed')));

      calAttendeeService.getUserDisplayNameForAttendee(attendee).then(function(result) {
        expect(calAttendeesCache.get).to.have.been.calledWith(attendee.email);
        expect(userUtils.displayNameOf).to.not.have.been.called;
        expect(result).to.equals(attendee.displayName);

        done();
      }).catch(done);

      $rootScope.$digest();
    });
  });

  describe('The getUsersIdsForAttendees function', function() {
    var attendees;

    beforeEach(function() {
      attendees = [
        { email: 'a@open-paas.org' },
        { email: 'b@open-paas.org' },
        { email: 'c@open-paas.org' }
      ];
    });

    it('should not resolve with attendees which failed', function(done) {
      calAttendeesCache.get.withArgs(attendees[0].email).returns($q.when({_id: 0}));
      calAttendeesCache.get.withArgs(attendees[1].email).returns($q.reject(new Error()));
      calAttendeesCache.get.withArgs(attendees[2].email).returns($q.when({_id: 2}));

      calAttendeeService.getUsersIdsForAttendees(attendees)
        .then(function(result) {
          expect(result).to.deep.equals([0, 2]);
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });

    it('should not fail when attendee is not an user', function(done) {
      calAttendeesCache.get.withArgs(attendees[0].email).returns($q.when({_id: 0}));
      calAttendeesCache.get.withArgs(attendees[1].email).returns($q.when());
      calAttendeesCache.get.withArgs(attendees[2].email).returns($q.when({_id: 2}));

      calAttendeeService.getUsersIdsForAttendees(attendees)
        .then(function(result) {
          expect(result).to.deep.equals([0, undefined, 2]);
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });
  });
});
