'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('the calendarAttendeeService', function() {
  var query, limit, CAL_ATTENDEE_OBJECT_TYPE, CAL_ICAL, $rootScope, calendarAttendeeService;
  var attendeeService = {};
  var attendeesAllTypes;

  beforeEach(function() {
    query = 'query';
    limit = 42;

    attendeeService.addProvider = function() {};
    attendeeService.getAttendeeCandidates = function() {
      return $q.when([]);
    };

    angular.mock.module('esn.calendar');
    angular.mock.module(function($provide) {
      $provide.value('attendeeService', attendeeService);
    });

    angular.mock.inject(function(_$rootScope_, _CAL_ATTENDEE_OBJECT_TYPE_, _CAL_ICAL_) {
      $rootScope = _$rootScope_;
      CAL_ATTENDEE_OBJECT_TYPE = _CAL_ATTENDEE_OBJECT_TYPE_;
      CAL_ICAL = _CAL_ICAL_;
    });
  });

  beforeEach(angular.mock.inject(function(_calendarAttendeeService_) {
    calendarAttendeeService = _calendarAttendeeService_;
  }));

  describe('the getAttendeeCandidates function', function() {
    beforeEach(function() {
      attendeesAllTypes = [
        CAL_ATTENDEE_OBJECT_TYPE.user,
        CAL_ATTENDEE_OBJECT_TYPE.resource,
        CAL_ATTENDEE_OBJECT_TYPE.group,
        CAL_ATTENDEE_OBJECT_TYPE.ldap
      ];
    });

    it('should return a promise', function() {
      expect(calendarAttendeeService.getAttendeeCandidates('query', 10)).to.be.a.function;
    });

    it('should add a need-action partstat to all attendeeCandidates which does not have objectType', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([{_id: 'attendee1'}, {_id: 'attendee2'}]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', partstat: CAL_ICAL.partstat.needsaction}, {_id: 'attendee2', partstat: CAL_ICAL.partstat.needsaction}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add a need-action partstat to all user attendeeCandidates', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([{_id: 'attendee1', objectType: CAL_ATTENDEE_OBJECT_TYPE.user}, {_id: 'attendee2', objectType: CAL_ATTENDEE_OBJECT_TYPE.user}]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', partstat: CAL_ICAL.partstat.needsaction}, {_id: 'attendee2', partstat: CAL_ICAL.partstat.needsaction}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add a tentative partstat to all resource attendeeCandidates', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([
        {_id: 'attendee1', objectType: CAL_ATTENDEE_OBJECT_TYPE.resource, administrators: [{id: '1', objectType: CAL_ATTENDEE_OBJECT_TYPE.resource}]},
        {_id: 'attendee2', objectType: CAL_ATTENDEE_OBJECT_TYPE.resource, administrators: [{id: '1', objectType: CAL_ATTENDEE_OBJECT_TYPE.resource}]}
      ]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', partstat: CAL_ICAL.partstat.tentative}, {_id: 'attendee2', partstat: CAL_ICAL.partstat.tentative}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add an tentative partstat to all group attendeeCandidates', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([{_id: 'attendee1', objectType: CAL_ATTENDEE_OBJECT_TYPE.group}, {_id: 'attendee2', objectType: CAL_ATTENDEE_OBJECT_TYPE.group}]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', partstat: CAL_ICAL.partstat.tentative}, {_id: 'attendee2', partstat: CAL_ICAL.partstat.tentative}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add an need-action partstat to all ldap attendee candidates', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([
        { _id: 'attendee1', objectType: CAL_ATTENDEE_OBJECT_TYPE.ldap },
        { _id: 'attendee2', objectType: CAL_ATTENDEE_OBJECT_TYPE.ldap }
      ]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes)
        .then(function(attendeeCandidates) {
          expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
          expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
          expect(attendeeCandidates).to.shallowDeepEqual([
            { _id: 'attendee1', partstat: CAL_ICAL.partstat.needsaction },
            { _id: 'attendee2', partstat: CAL_ICAL.partstat.needsaction }
          ]);
          done();
        }, done);

      $rootScope.$apply();
    });

    it('should add an accepted partstat to all resource attendeeCandidates without administators', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([
        {_id: 'attendee1', objectType: CAL_ATTENDEE_OBJECT_TYPE.resource, administrators: []},
        {_id: 'attendee2', objectType: CAL_ATTENDEE_OBJECT_TYPE.resource, administrators: []}
      ]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', partstat: CAL_ICAL.partstat.accepted}, {_id: 'attendee2', partstat: CAL_ICAL.partstat.accepted}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add a need-action partstat to all attendeeCandidates which are not recognized', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([{_id: 'attendee1', objectType: 'this is not a supported objectType'}, {_id: 'attendee2'}]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', partstat: CAL_ICAL.partstat.needsaction}, {_id: 'attendee2', partstat: CAL_ICAL.partstat.needsaction}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add an individual cutype to all attendeeCandidates which does not have objectType', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([{_id: 'attendee1'}, {_id: 'attendee2'}]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', cutype: CAL_ICAL.cutype.individual}, {_id: 'attendee2', cutype: CAL_ICAL.cutype.individual}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add an individual cutype to all user attendeeCandidates', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([{_id: 'attendee1', objectType: CAL_ATTENDEE_OBJECT_TYPE.user}, {_id: 'attendee2', objectType: CAL_ATTENDEE_OBJECT_TYPE.user}]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', cutype: CAL_ICAL.cutype.individual}, {_id: 'attendee2', cutype: CAL_ICAL.cutype.individual}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add a resource cutype to all resource attendeeCandidates', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([{_id: 'attendee1', objectType: CAL_ATTENDEE_OBJECT_TYPE.resource}, {_id: 'attendee2', objectType: CAL_ATTENDEE_OBJECT_TYPE.resource}]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', cutype: CAL_ICAL.cutype.resource}, {_id: 'attendee2', cutype: CAL_ICAL.cutype.resource}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add a group cutype to all group attendeeCandidates', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([{_id: 'attendee1', objectType: CAL_ATTENDEE_OBJECT_TYPE.group}, {_id: 'attendee2', objectType: CAL_ATTENDEE_OBJECT_TYPE.group}]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', cutype: CAL_ICAL.cutype.group}, {_id: 'attendee2', cutype: CAL_ICAL.cutype.group}]);
        done();
      }, done);

      $rootScope.$apply();
    });

    it('should add a ldap cutype to all ldap attendee candidates', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([
        { _id: 'attendee1', objectType: CAL_ATTENDEE_OBJECT_TYPE.ldap },
        { _id: 'attendee2', objectType: CAL_ATTENDEE_OBJECT_TYPE.ldap }
      ]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes)
        .then(function(attendeeCandidates) {
          expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
          expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
          expect(attendeeCandidates).to.shallowDeepEqual([
            { _id: 'attendee1', cutype: CAL_ICAL.cutype.ldap },
            { _id: 'attendee2', cutype: CAL_ICAL.cutype.ldap }
          ]);
          done();
        }, done);

      $rootScope.$apply();
    });

    it('should add an individual cutype to all attendeeCandidates which are not recognized', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when([{_id: 'attendee1', objectType: 'this is not a supported objectType'}, {_id: 'attendee2'}]));

      calendarAttendeeService.getAttendeeCandidates(query, limit, attendeesAllTypes).then(function(attendeeCandidates) {
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledOnce;
        expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, attendeesAllTypes);
        expect(attendeeCandidates).to.shallowDeepEqual([{_id: 'attendee1', cutype: CAL_ICAL.cutype.individual}, {_id: 'attendee2', cutype: CAL_ICAL.cutype.individual}]);
        done();
      }, done);

      $rootScope.$apply();
    });
  });
});
