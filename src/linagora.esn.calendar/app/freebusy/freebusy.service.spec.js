'use strict';

/* global chai, sinon, __FIXTURES__: false */

var expect = chai.expect;

describe('The calFreebusyService service', function() {
  var vfreebusy, $httpBackend, $rootScope, calFreebusyService, calMoment, CAL_ACCEPT_HEADER, CAL_DAV_DATE_FORMAT, CAL_FREEBUSY;
  var calAttendeeService, calFreebusyAPI;

  beforeEach(function() {
    angular.mock.module('esn.calendar');

    calAttendeeService = {
      getUsersIdsForAttendees: sinon.stub(),
      getUserIdForAttendee: sinon.stub()
    };

    angular.mock.module(function($provide) {
      $provide.value('calAttendeeService', calAttendeeService);
    });
  });

  beforeEach(function() {
    angular.mock.inject(function(_$rootScope_, _$httpBackend_, _calFreebusyAPI_, _calFreebusyService_, _CAL_ACCEPT_HEADER_, _calMoment_, _CAL_DAV_DATE_FORMAT_, _CAL_FREEBUSY_) {
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      calFreebusyService = _calFreebusyService_;
      calFreebusyAPI = _calFreebusyAPI_;
      calMoment = _calMoment_;
      CAL_ACCEPT_HEADER = _CAL_ACCEPT_HEADER_;
      CAL_DAV_DATE_FORMAT = _CAL_DAV_DATE_FORMAT_;
      CAL_FREEBUSY = _CAL_FREEBUSY_;
    });

    function getComponentFromFixture(string) {
      var path = 'frontend/app/fixtures/calendar/vfreebusy_test/' + string;

      return __FIXTURES__[path];
    }

    vfreebusy = JSON.parse(getComponentFromFixture('vfreebusy.json'));
  });

  describe('The listFreebusy fn', function() {

    it('should list freebusy infos', function(done) {
      var data = {
        type: 'free-busy-query',
        match: {
          start: calMoment('20140101T000000').tz('Zulu').format(CAL_DAV_DATE_FORMAT),
          end: calMoment('20140102T000000').tz('Zulu').format(CAL_DAV_DATE_FORMAT)
        }
      };

      var response = {
        _links: {
          self: {
            href: '/calendars/56698ca29e4cf21f66800def.json'
          }
        },
        _embedded: {
          'dav:calendar': [
            {
              _links: {
                self: {
                  href: '/calendars/uid/events.json'
                }
              },
              'dav:name': null,
              'caldav:description': null,
              'calendarserver:ctag': 'http://sabre.io/ns/sync/3',
              'apple:color': null,
              'apple:order': null
            }
          ]
        }
      };

      $httpBackend.expectGET('/dav/api/calendars/uid.json?withFreeBusy=true&withRights=true', { Accept: CAL_ACCEPT_HEADER }).respond(response);

      $httpBackend.expect('REPORT', '/dav/api/calendars/uid/events.json', data).respond(200, {
        _links: {
          self: {href: '/prepath/path/to/calendar.json'}
        },
        data: [
          'vcalendar', [], [
            vfreebusy
          ]
        ]
      });

      var start = calMoment(new Date(2014, 0, 1));
      var end = calMoment(new Date(2014, 0, 2));

      calFreebusyService.listFreebusy('uid', start, end).then(function(freebusies) {
        expect(freebusies).to.be.an.array;
        expect(freebusies.length).to.equal(1);
        expect(freebusies[0].vfreebusy.toJSON()).to.deep.equal(vfreebusy);
      }).finally(done);

      $httpBackend.flush();
    });
  });

  describe('the isAttendeeAvailable function', function() {
    var attendee;
    var handleBackend;

    beforeEach(function() {
      attendee = { id: 'uid' };

      handleBackend = function handleBackned() {
        var response;

        response = {
          _links: {
            self: {
              href: '/calendars/56698ca29e4cf21f66800def.json'
            }
          },
          _embedded: {
            'dav:calendar': [
              {
                _links: {
                  self: {
                    href: '/calendars/uid/events.json'
                  }
                },
                'dav:name': null,
                'caldav:description': null,
                'calendarserver:ctag': 'http://sabre.io/ns/sync/3',
                'apple:color': null,
                'apple:order': null
              }
            ]
          }
        };

        $httpBackend.expectGET('/dav/api/calendars/uid.json?withFreeBusy=true&withRights=true', { Accept: CAL_ACCEPT_HEADER }).respond(response);
        $httpBackend.expect('REPORT', '/dav/api/calendars/uid/events.json', undefined).respond(200, {
          _links: {
            self: {href: '/prepath/path/to/calendar.json'}
          },
          data: [
            'vcalendar', [], [
              vfreebusy
            ]
          ]
        });
      };
    });

    it('should return false on attendee busy', function(done) {
      var busyEvent = {
        start: calMoment('2018-03-03T09:00:00Z'),
        end: calMoment('2018-03-03T13:00:00Z')
      };

      handleBackend();
      calFreebusyService.isAttendeeAvailable(attendee.id, busyEvent.start, busyEvent.end).then(function(isAvailable) {
        expect(isAvailable).to.be.false;

        done();
      });

      $httpBackend.flush();
    });

    it('should return true on attendee free', function(done) {
      var event = {
        start: calMoment('2018-03-03T11:00:00Z'),
        end: calMoment('2018-03-03T12:00:00Z')
      };

      handleBackend();
      calFreebusyService.isAttendeeAvailable(attendee.id, event.start, event.end).then(function(isAvailable) {
        expect(isAvailable).to.be.true;

        done();
      });

      $httpBackend.flush();
    });
  });

  describe('The getAttendeesAvailability function', function() {
    var getBulkFreebusyStatusStub;

    beforeEach(function() {
      getBulkFreebusyStatusStub = sinon.stub(calFreebusyAPI, 'getBulkFreebusyStatus');
    });

    it('should call bulk service with users having an id', function(done) {
      var attendees = [
        { email: 'a@open-paas.org' },
        { email: 'b@open-paas.org' },
        { email: 'c@open-paas.org' }
      ];
      var start = Date.now();
      var end = Date.now();

      calAttendeeService.getUsersIdsForAttendees.returns($q.when([1, undefined, 2]));
      getBulkFreebusyStatusStub.returns($q.when());

      calFreebusyService.getAttendeesAvailability(attendees, start, end)
        .then(function() {
          expect(calAttendeeService.getUsersIdsForAttendees).to.have.been.calledWith(attendees);
          expect(getBulkFreebusyStatusStub).to.have.been.calledWith([1, 2], start, end);
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });
  });

  describe('The areAttendeesAvailable function', function() {
    var start, end, attendees, event, getBulkFreebusyStatusStub;

    beforeEach(function() {
      event = {uid: 123};
      getBulkFreebusyStatusStub = sinon.stub(calFreebusyAPI, 'getBulkFreebusyStatus');
      attendees = [
        { email: 'a@open-paas.org' },
        { email: 'b@open-paas.org' }
      ];
      start = '';
      end = '';
    });

    it('should resolve with true if all attendees are available', function(done) {
      var availability = {
        start: '',
        end: '',
        users: [
          {
            id: 1,
            calendars: [
              {
                id: 1,
                busy: []
              },
              {
                id: 2,
                busy: []
              }
            ]
          },
          {
            id: 2,
            calendars: [
              {
                id: 2,
                busy: []
              },
              {
                id: 22,
                busy: []
              }
            ]
          }
        ]
      };

      calAttendeeService.getUsersIdsForAttendees.returns($q.when([1, 2]));
      getBulkFreebusyStatusStub.returns($q.when(availability));

      calFreebusyService.areAttendeesAvailable(attendees, start, end, [event])
        .then(function(result) {
          expect(result).to.be.true;
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });

    it('should resolve with false if at least one attendee is not available during the period', function(done) {
      var availability = {
        start: '',
        end: '',
        users: [
          {
            id: 1,
            calendars: [
              {
                id: 1,
                busy: []
              },
              {
                id: 2,
                busy: [{id: 'eventId', start: 1, end: 2}]
              }
            ]
          },
          {
            id: 2,
            calendars: [
              {
                id: 2,
                busy: []
              },
              {
                id: 22,
                busy: []
              }
            ]
          }
        ]
      };

      calAttendeeService.getUsersIdsForAttendees.returns($q.when([1, 2]));
      getBulkFreebusyStatusStub.returns($q.when(availability));

      calFreebusyService.areAttendeesAvailable(attendees, start, end, [event])
        .then(function(result) {
          expect(result).to.be.false;
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });
  });

  describe('The setBulkFreeBusyStatus function', function() {
    var start, end, attendees, event, getBulkFreebusyStatusStub, externalAttendee;

    beforeEach(function() {
      event = {uid: 123};
      getBulkFreebusyStatusStub = sinon.stub(calFreebusyAPI, 'getBulkFreebusyStatus');
      attendees = [
        { email: 'a@open-paas.org' },
        { email: 'b@open-paas.org' }
      ];
      externalAttendee = { email: 'external@mail.com' };
      start = '';
      end = '';
    });

    it('should do nothing if attendees list is empty', function() {
      attendees = [];
      calAttendeeService.getUserIdForAttendee.returns($q.when());
      getBulkFreebusyStatusStub.returns($q.when({}));

      calFreebusyService.setBulkFreeBusyStatus(attendees, start, end, [event]);
      $rootScope.$digest();

      expect(calAttendeeService.getUserIdForAttendee).to.not.have.been.called;
      expect(getBulkFreebusyStatusStub).to.not.have.been.called;
    });

    it('should get the user id from attendee when attendee does not have id', function() {
      attendees[1].id = '1';
      calAttendeeService.getUserIdForAttendee.returns($q.when());
      getBulkFreebusyStatusStub.returns($q.when({}));

      calFreebusyService.setBulkFreeBusyStatus(attendees, start, end, [event]);
      $rootScope.$digest();

      expect(calAttendeeService.getUserIdForAttendee).to.have.been.calledWith(attendees[0]);
    });

    it('should get the user id from attendee when attendee id is the same as email', function() {
      attendees[1].id = '1';
      attendees[0].id = attendees[0].email;
      calAttendeeService.getUserIdForAttendee.returns($q.when());
      getBulkFreebusyStatusStub.returns($q.when({}));

      calFreebusyService.setBulkFreeBusyStatus(attendees, start, end, [event]);
      $rootScope.$digest();

      expect(calAttendeeService.getUserIdForAttendee).to.have.been.calledWith(attendees[0]);
    });

    describe('When there are external attendees', function() {
      beforeEach(function() {
        calAttendeeService.getUserIdForAttendee.withArgs(attendees[0]).returns($q.when('1'));
        calAttendeeService.getUserIdForAttendee.withArgs(attendees[1]).returns($q.when('2'));
        calAttendeeService.getUserIdForAttendee.withArgs(externalAttendee).returns($q.when());

        attendees.push(externalAttendee);
      });

      it('should call the bulk API for internal attendees only', function() {
        getBulkFreebusyStatusStub.returns($q.when({}));
        calFreebusyService.setBulkFreeBusyStatus(attendees, start, end, [event]);
        $rootScope.$digest();

        expect(getBulkFreebusyStatusStub).to.have.been.calledWith(['1', '2'], start, end, [event.uid]);
      });

      it('should set freebusy to unknow for external attendees', function() {
        getBulkFreebusyStatusStub.returns($q.when({}));
        calFreebusyService.setBulkFreeBusyStatus(attendees, start, end, [event]);
        $rootScope.$digest();

        expect(externalAttendee.freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
      });

      it('should set freebusy to unknow for internal users when freebusy status is not found', function() {
        getBulkFreebusyStatusStub.returns($q.when({}));
        calFreebusyService.setBulkFreeBusyStatus(attendees, start, end, [event]);
        $rootScope.$digest();

        expect(attendees[0].freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
        expect(attendees[1].freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
      });

      it('should set freebusy to free for internal users when they are free', function() {
        var bulkResponse = {
          users: [
            {
              id: '1',
              calendars: [
                {
                  id: 1,
                  busy: []
                },
                {
                  id: 2,
                  busy: []
                }
              ]
            },
            {
              id: '4',
              calendars: [
                {
                  id: 2,
                  busy: []
                },
                {
                  id: 22,
                  busy: []
                }
              ]
            }
          ]
        };

        getBulkFreebusyStatusStub.returns($q.when(bulkResponse));
        calFreebusyService.setBulkFreeBusyStatus(attendees, start, end, [event]);
        $rootScope.$digest();

        expect(attendees[0].freeBusy).to.equal(CAL_FREEBUSY.FREE);
        expect(attendees[1].freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
        expect(attendees[2].freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
      });

      it('should set freebusy to busy for internal users when they are busy', function() {
        var bulkResponse = {
          users: [
            {
              id: '1',
              calendars: [
                {
                  id: 1,
                  busy: [{start: new Date(), end: new Date()}]
                },
                {
                  id: 2,
                  busy: []
                }
              ]
            },
            {
              id: '4',
              calendars: [
                {
                  id: 2,
                  busy: []
                },
                {
                  id: 22,
                  busy: []
                }
              ]
            }
          ]
        };

        getBulkFreebusyStatusStub.returns($q.when(bulkResponse));
        calFreebusyService.setBulkFreeBusyStatus(attendees, start, end, [event]);
        $rootScope.$digest();

        expect(attendees[0].freeBusy).to.equal(CAL_FREEBUSY.BUSY);
        expect(attendees[1].freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
        expect(attendees[2].freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
      });

      it('should set freebusy to unknow for internal users when an error occurs', function() {
        getBulkFreebusyStatusStub.returns($q.reject(new Error()));
        calFreebusyService.setBulkFreeBusyStatus(attendees, start, end, [event]);
        $rootScope.$digest();

        expect(attendees[0].freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
        expect(attendees[1].freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
        expect(attendees[2].freeBusy).to.equal(CAL_FREEBUSY.UNKNOWN);
      });
    });
  });
});
