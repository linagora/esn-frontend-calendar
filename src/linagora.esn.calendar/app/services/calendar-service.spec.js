'use strict';

/* global chai, sinon: false, _: false */

var expect = chai.expect;

describe('The calendarService service', function() {
  var CalendarCollectionShellMock,
    CalendarCollectionShellFuncMock,
    CalendarRightShellMock,
    self,
    CalendarRightShellResult,
    calendarApiOptions,
    listCalendars,
    calendarsCacheMock,
    userUtilsMock;

  beforeEach(function() {
    self = this;

    calendarApiOptions = {
      withRights: true
    };

    CalendarCollectionShellMock = function() {
      return CalendarCollectionShellFuncMock.apply(this, arguments);
    };

    listCalendars = null;
    calendarsCacheMock = {
      getList: sinon.stub().returns(listCalendars),
      setList: sinon.stub(),
      remove: sinon.stub(),
      get: sinon.stub(),
      set: sinon.stub()
    };
    userUtilsMock = {
      displayNameOf: sinon.stub()
    };

    CalendarRightShellResult = {};
    CalendarRightShellMock = sinon.stub().returns(CalendarRightShellResult);

    angular.mock.module('esn.calendar');
    angular.mock.module(function($provide) {
      $provide.value('CalendarCollectionShell', CalendarCollectionShellMock);
      $provide.value('CalendarRightShell', CalendarRightShellMock);
      $provide.value('calendarsCache', calendarsCacheMock);
      $provide.value('userUtils', userUtilsMock);
    });
  });

  beforeEach(angular.mock.inject(function(calendarService, $httpBackend, $rootScope, calendarAPI, calCalendarSubscriptionApiService, calDefaultValue, CAL_EVENTS, CAL_CALENDAR_SHARED_INVITE_STATUS) {
    this.$httpBackend = $httpBackend;
    this.$rootScope = $rootScope;
    this.calendarService = calendarService;
    this.calendarAPI = calendarAPI;
    this.calCalendarSubscriptionApiService = calCalendarSubscriptionApiService;
    this.CAL_EVENTS = CAL_EVENTS;
    this.calDefaultValue = calDefaultValue;
    this.CAL_CALENDAR_SHARED_INVITE_STATUS = CAL_CALENDAR_SHARED_INVITE_STATUS;
  }));

  beforeEach(function() {
    this.calDefaultValue.set('calendarId', 'calendarId');
  });

  describe('The removeAndEmit function', function() {
    it('should broadcast a CALENDARS.REMOVE event when the calendar has been created', function() {
      CalendarCollectionShellMock.buildUniqueId = sinon.stub().returns('calUniqueId');

      var calendar = {id: 'calId'};

      this.$rootScope.$broadcast = sinon.stub().returns({});
      this.calendarService.removeAndEmit('homeId', calendar);
      this.$rootScope.$digest();

      expect(self.$rootScope.$broadcast).to.have.been.calledWith(this.CAL_EVENTS.CALENDARS.REMOVE, {uniqueId: 'calUniqueId'});
      expect(CalendarCollectionShellMock.buildUniqueId).to.have.been.calledWith('homeId', calendar.id);
    });
  });

  describe('The addAndEmit function', function() {
    var calendar, homeId;

    beforeEach(function() {
      calendar = {id: 'calId', uniqueId: 'uniqueId'};
      homeId = 'homeId';
    });

    it('should broadcast a CALENDARS.ADD event when the calendar has been created', function() {
      this.$rootScope.$broadcast = sinon.stub().returns({});
      this.calendarService.addAndEmit(homeId, calendar);
      this.$rootScope.$digest();

      expect(self.$rootScope.$broadcast).to.have.been.calledWith(this.CAL_EVENTS.CALENDARS.ADD, calendar);
    });

    it('should not add the calendar if already in cache', function() {
      var spy = sinon.spy(function() {
        return {};
      });

      this.$rootScope.$broadcast = spy;

      this.calendarService.addAndEmit(homeId, calendar);
      this.$rootScope.$digest();
      this.calendarService.addAndEmit(homeId, calendar);
      this.$rootScope.$digest();

      expect(spy.withArgs(this.CAL_EVENTS.CALENDARS.ADD, calendar)).to.have.been.calledTwice;
    });

    it('should add the calendar if not already in cache', function() {
      var spy = sinon.spy(function() {
        return {};
      });
      var calendar2 = {id: calendar.id + 'foo', uniqueId: calendar.uniqueId + 'bar'};

      this.$rootScope.$broadcast = spy;
      this.calendarService.addAndEmit(homeId, calendar);
      this.$rootScope.$digest();
      this.calendarService.addAndEmit(homeId, calendar2);
      this.$rootScope.$digest();

      expect(spy.withArgs(this.CAL_EVENTS.CALENDARS.ADD, calendar)).to.have.been.calledOnce;
      expect(spy.withArgs(this.CAL_EVENTS.CALENDARS.ADD, calendar2)).to.have.been.calledOnce;
    });
  });

  describe('The updateAndEmit function', function() {
    it('should broadcast a CALENDARS.UPDATE event when the calendar has been created', function() {
      var calendar = {id: 'calId'};

      this.$rootScope.$broadcast = sinon.stub().returns({});
      this.calendarService.updateAndEmit('homeId', calendar);
      this.$rootScope.$digest();

      expect(self.$rootScope.$broadcast).to.have.been.calledWith(this.CAL_EVENTS.CALENDARS.UPDATE, calendar);
    });
  });

  describe('The listCalendars fn', function() {
    var response;

    beforeEach(function() {
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
                  href: '/calendars/56698ca29e4cf21f66800def/events.json'
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
    });

    it('should always call calendarAPI.listCalendars with default withRights options when options parameter not specified', function() {
      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when();
      });

      this.calendarService.listCalendars('homeId');

      expect(self.calendarAPI.listCalendars).to.be.calledWith('homeId', calendarApiOptions);
    });

    it('should call calendarAPI.listCalendars with options parameters if specified', function() {
      var options = { option: true };

      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when();
      });

      this.calendarService.listCalendars('homeId', options);

      expect(self.calendarAPI.listCalendars).to.be.calledWith('homeId', options);
    });

    it('should cache the calls calendarService.listCalendars', function() {
      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when([]);
      });

      this.calendarService.listCalendars('homeId').then(function() {
        self.calendarService.listCalendars('homeId').then(function() {
          expect(self.calendarAPI.listCalendars).to.have.been.called.once;
        });
      });
      this.$rootScope.$digest();
    });

    it('should wrap each received dav:calendar in a CalendarCollectionShell', function(done) {
      var calendarCollection = {id: this.calDefaultValue.get('calendarId')};

      CalendarCollectionShellFuncMock = sinon.spy(function(davCal) {
        expect(davCal).to.deep.equal(response._embedded['dav:calendar'][0]);

        return calendarCollection;
      });

      this.$httpBackend.expectGET('/dav/api/calendars/homeId.json?withRights=true').respond(response);

      this.calendarService.listCalendars('homeId').then(function(calendars) {
        expect(calendars).to.have.length(1);
        expect(calendars[0]).to.equal(calendarCollection);
        expect(CalendarCollectionShellFuncMock).to.have.been.called;
        done();
      });

      this.$httpBackend.flush();
    });

    it('should cache calendars', function() {
      CalendarCollectionShellFuncMock = angular.identity;

      this.$httpBackend.expectGET('/dav/api/calendars/homeId.json?withRights=true').respond(response);

      this.calendarService.listCalendars('homeId').then(function(calendars) {
        calendarsCacheMock.getList = sinon.stub().returns(calendars);
        self.calendarService.listCalendars('homeId').then(function(calendars2) {
          expect(calendars).to.equal(calendars2);
        });
      });

      this.$httpBackend.flush();
    });
  });

  describe('The listPublicCalendars fn', function() {
    var homeId;

    beforeEach(function() {
      homeId = 'TheHomeId';
    });

    it('should call calendarAPI.listCalendars with withRights and public options', function() {
      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when();
      });

      this.calendarService.listPublicCalendars(homeId);

      expect(self.calendarAPI.listCalendars).to.be.calledWith(homeId, { withRights: true, sharedPublic: true });
    });

    it('should return an array of CalendarCollectionShell', function(done) {
      var calendarCollection = {id: this.calDefaultValue.get('calendarId')};
      var calendars = [
        {
          _links: {
            self: {
              href: '/calendars/' + homeId + '/events.json'
            }
          },
          'dav:name': null,
          'caldav:description': null,
          'calendarserver:ctag': 'http://sabre.io/ns/sync/3',
          'apple:color': null,
          'apple:order': null
        }
      ];

      CalendarCollectionShellFuncMock = sinon.spy(function() {
        return calendarCollection;
      });

      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when(calendars);
      });

      this.calendarService.listPublicCalendars(homeId).then(function(result) {
        expect(result).to.be.an('array').to.have.lengthOf(calendars.length);
        expect(result[0]).to.deep.equals(calendarCollection);
        expect(CalendarCollectionShellFuncMock).to.have.been.calledOnce;
        expect(CalendarCollectionShellFuncMock).to.have.been.calledWith(calendars[0]);
        done();
      }, done);

      this.$rootScope.$digest();
    });
  });

  describe('The listSubscriptionCalendars fn', function() {
    var homeId;

    beforeEach(function() {
      homeId = 'TheHomeId';
    });

    it('should call calendarAPI.listCalendars with withRights and sharedPublicSubscription options', function() {
      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when();
      });

      this.calendarService.listSubscriptionCalendars(homeId);

      expect(self.calendarAPI.listCalendars).to.be.calledWith(homeId, { withRights: true, sharedPublicSubscription: true });
    });

    it('should return an array of CalendarCollectionShell', function(done) {
      var calendarCollection = {id: this.calDefaultValue.get('calendarId')};
      var calendars = [
        {
          _links: {
            self: {
              href: '/calendars/' + homeId + '/events.json'
            }
          },
          'dav:name': null,
          'caldav:description': null,
          'calendarserver:ctag': 'http://sabre.io/ns/sync/3',
          'apple:color': null,
          'apple:order': null
        }
      ];

      CalendarCollectionShellFuncMock = sinon.spy(function() {
        return calendarCollection;
      });

      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when(calendars);
      });

      this.calendarService.listSubscriptionCalendars(homeId).then(function(result) {
        expect(result).to.be.an('array').to.have.lengthOf(calendars.length);
        expect(result[0]).to.deep.equals(calendarCollection);
        expect(CalendarCollectionShellFuncMock).to.have.been.calledOnce;
        expect(CalendarCollectionShellFuncMock).to.have.been.calledWith(calendars[0]);
        done();
      }, done);

      this.$rootScope.$digest();
    });
  });

  describe('The listDelegationCalendars fn', function() {
    var homeId, sharedDelegationStatus;

    beforeEach(function() {
      homeId = 'TheHomeId';
      sharedDelegationStatus = 'accepted';
    });

    it('should reject with unsupported sharedDelegationStatus', function(done) {
      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when();
      });

      this.calendarService
        .listDelegationCalendars(homeId, 'notSupportedSharedDelegationStatus')
        .catch(function(error) {
          expect(error).to.equal('The status of the delegated calendar must be either "accepted" or "noresponse"');

          done();
        });

      expect(self.calendarAPI.listCalendars).to.not.have.been.called;

      this.$rootScope.$digest();
    });

    it('should call calendarAPI.listCalendars with withRights and sharedDelegationStatus options', function() {
      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when();
      });

      this.calendarService.listDelegationCalendars(homeId, sharedDelegationStatus);

      expect(self.calendarAPI.listCalendars).to.be.calledWith(homeId, { withRights: true, sharedDelegationStatus: sharedDelegationStatus });
    });

    it('should return an array of CalendarCollectionShell', function(done) {
      var calendarCollection = {id: this.calDefaultValue.get('calendarId')};
      var calendars = [
        {
          _links: {
            self: {
              href: '/calendars/' + homeId + '/events.json'
            }
          },
          'dav:name': null,
          'caldav:description': null,
          'calendarserver:ctag': 'http://sabre.io/ns/sync/3',
          'apple:color': null,
          'apple:order': null
        }
      ];

      CalendarCollectionShellFuncMock = sinon.spy(function() {
        return calendarCollection;
      });

      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when(calendars);
      });

      this.calendarService.listDelegationCalendars(homeId, sharedDelegationStatus).then(function(result) {
        expect(result).to.be.an('array').to.have.lengthOf(calendars.length);
        expect(result[0]).to.deep.equals(calendarCollection);
        expect(CalendarCollectionShellFuncMock).to.have.been.calledOnce;
        expect(CalendarCollectionShellFuncMock).to.have.been.calledWith(calendars[0]);
        done();
      }, done);

      this.$rootScope.$digest();
    });
  });

  describe('The listFreeBusyCalendars fn', function() {
    var homeId;

    beforeEach(function() {
      homeId = 'TheHomeId';
    });

    it('should call calendarAPI.listCalendars with withRights and withFreeBusy options', function() {
      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when();
      });

      this.calendarService.listFreeBusyCalendars(homeId);

      expect(self.calendarAPI.listCalendars).to.be.calledWith(homeId, { withRights: true, withFreeBusy: true });
    });

    it('should return an array of CalendarCollectionShell', function(done) {
      var calendarCollection = {id: this.calDefaultValue.get('calendarId')};
      var calendars = [
        {
          _links: {
            self: {
              href: '/calendars/' + homeId + '/events.json'
            }
          },
          'dav:name': null,
          'caldav:description': null,
          'calendarserver:ctag': 'http://sabre.io/ns/sync/3',
          'apple:color': null,
          'apple:order': null
        }
      ];

      CalendarCollectionShellFuncMock = sinon.spy(function() {
        return calendarCollection;
      });

      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when(calendars);
      });

      this.calendarService.listFreeBusyCalendars(homeId).then(function(result) {
        expect(result).to.be.an('array').to.have.lengthOf(calendars.length);
        expect(result[0]).to.deep.equals(calendarCollection);
        expect(CalendarCollectionShellFuncMock).to.have.been.calledOnce;
        expect(CalendarCollectionShellFuncMock).to.have.been.calledWith(calendars[0]);
        done();
      }, done);

      this.$rootScope.$digest();
    });
  });

  describe('The listPersonalAndAcceptedDelegationCalendars fn', function() {
    var homeId;

    beforeEach(function() {
      homeId = 'TheHomeId';
    });

    it('should call calendarAPI.listCalendars with the correspondent options', function() {
      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when();
      });

      this.calendarService.listPersonalAndAcceptedDelegationCalendars(homeId);

      expect(self.calendarAPI.listCalendars).to.be.calledWith(homeId, {
        withRights: true,
        personal: true,
        sharedPublicSubscription: true,
        sharedDelegationStatus: 'accepted'
      });
    });

    it('should return an array of CalendarCollectionShell', function(done) {
      var calendarCollection = {id: this.calDefaultValue.get('calendarId')};
      var calendars = [
        {
          _links: {
            self: {
              href: '/calendars/' + homeId + '/events.json'
            }
          },
          'dav:name': null,
          'caldav:description': null,
          'calendarserver:ctag': 'http://sabre.io/ns/sync/3',
          'apple:color': null,
          'apple:order': null
        }
      ];

      CalendarCollectionShellFuncMock = sinon.spy(function() {
        return calendarCollection;
      });

      this.calendarAPI.listCalendars = sinon.spy(function() {
        return $q.when(calendars);
      });

      this.calendarService.listPersonalAndAcceptedDelegationCalendars(homeId).then(function(result) {
        expect(result).to.be.an('array').to.have.lengthOf(calendars.length);
        expect(result[0]).to.deep.equals(calendarCollection);
        expect(CalendarCollectionShellFuncMock).to.have.been.calledOnce;
        expect(CalendarCollectionShellFuncMock).to.have.been.calledWith(calendars[0]);
        done();
      }, done);

      this.$rootScope.$digest();
    });
  });

  describe('The get calendar fn', function() {
    it('should wrap the received dav:calendar in a CalendarCollectionShell', function(done) {
      var response = {
        _links: {
          self: {
            href: '/calendars/56698ca29e4cf21f66800def/events.json'
          }
        },
        'dav:name': null,
        'caldav:description': null,
        'calendarserver:ctag': 'http://sabre.io/ns/sync/3',
        'apple:color': null,
        'apple:order': null
      };

      var calendarCollection = {};

      CalendarCollectionShellFuncMock = sinon.spy(function(davCal) {
        expect(davCal).to.deep.equal(response);

        return calendarCollection;
      });

      this.$httpBackend.expectGET('/dav/api/calendars/homeId/id.json?withRights=true').respond(response);

      this.calendarService.getCalendar('homeId', 'id', true).then(function(calendar) {
        expect(calendar).to.equal(calendarCollection);
        expect(CalendarCollectionShellFuncMock).to.have.been.called;
        done();
      });

      this.$httpBackend.flush();
    });

    it('should call the calendarAPI.getCalendar with right params', function() {
      this.calendarAPI.getCalendar = sinon.spy(function() {
        return $q.when();
      });

      this.calendarService.getCalendar('homeId', 'id', true);

      expect(this.calendarAPI.getCalendar).to.be.calledWith('homeId', 'id', calendarApiOptions);
    });

    it('should call the calendarAPI.getCalendar when there is no cached calendar', function() {
      this.calendarAPI.getCalendar = sinon.stub().returns($q.when());

      this.calendarService.getCalendar('homeId', 'id', false);

      expect(calendarsCacheMock.get).to.have.been.calledWith('homeId', 'id');
      expect(this.calendarAPI.getCalendar).to.have.been.calledWith('homeId', 'id', calendarApiOptions);
    });
  });

  describe('The get right calendar fn', function() {
    it('should wrap the returning server response in  a CalendarRightShell', function() {
      var calendar = {id: 'calId'};

      var body = {
        acl: 'acl',
        invite: 'invite'
      };

      this.$httpBackend.expect('PROPFIND', '/dav/api/calendars/homeId/calId.json', {
        prop: ['cs:invite', 'acl']
      }).respond(200, body);

      var thenSpy = sinon.spy();

      this.calendarService.getRight('homeId', calendar).then(thenSpy);
      this.$httpBackend.flush();
      expect(thenSpy).to.have.been.calledWith(sinon.match.same(CalendarRightShellResult));
      expect(CalendarRightShellMock).to.have.been.calledWith(body.acl, body.invite);
    });
  });

  describe('The remove calendar fn', function() {
    beforeEach(function() {
      CalendarCollectionShellMock.buildUniqueId = sinon.stub().returns('calUniqueId');
    });

    it('should send a delete request to the correct URL', function() {
      this.$httpBackend.expectDELETE('/dav/api/calendars/homeId/cal.json').respond(204, 'response');

      var promiseSpy = sinon.spy();

      this.calendarService.removeCalendar('homeId', {id: 'cal'}).then(promiseSpy);

      this.$httpBackend.flush();
      this.$rootScope.$digest();

      expect(promiseSpy).to.have.been.calledWith(sinon.match({data: 'response'}));
    });

    it('should sync cache of list calendars', function() {
      CalendarCollectionShellFuncMock = angular.identity;

      this.$httpBackend.expectGET('/dav/api/calendars/homeId.json?withRights=true').respond({_embedded: {
        'dav:calendar': [{id: 1}, {id: 2}]
      }});

      this.$httpBackend.expectDELETE('/dav/api/calendars/homeId/2.json').respond(204, 'response');

      var thenSpy = sinon.spy();
      this.calendarService.listCalendars('homeId').then(function() {
        calendarsCacheMock.getList = sinon.stub().returns([{id: 1}]);

        self.calendarService.removeCalendar('homeId', {id: 2}).then(function() {
          self.calendarService.listCalendars('homeId').then(thenSpy);
        });
      });

      this.$httpBackend.flush();
      this.$rootScope.$digest();
      expect(thenSpy).to.have.been.calledWith(sinon.match({
        length: 1,
        0: {id: 1}
      }));
    });

    it('should broadcast a CALENDARS.REMOVE event when the calendar has been created', function() {
      var calendar = {id: 'calId'};

      this.$httpBackend.expectDELETE('/dav/api/calendars/homeId/calId.json').respond(204, 'response');
      this.$rootScope.$broadcast = sinon.stub().returns({});
      this.calendarService.removeCalendar('homeId', calendar);

      this.$httpBackend.flush();
      this.$rootScope.$digest();

      expect(self.$rootScope.$broadcast).to.have.been.calledWith(this.CAL_EVENTS.CALENDARS.REMOVE, {uniqueId: 'calUniqueId'});
    });
  });

  describe('The create calendar fn', function() {
    it('should send a post request to the correct URL', function() {
      var calendar = {id: 'calId'};

      CalendarCollectionShellMock.toDavCalendar = sinon.spy(angular.identity);

      this.$httpBackend.expectPOST('/dav/api/calendars/homeId.json').respond(201, {});

      var promiseSpy = sinon.spy();

      this.calendarService.createCalendar('homeId', calendar).then(promiseSpy);

      this.$httpBackend.flush();
      this.$rootScope.$digest();

      expect(promiseSpy).to.have.been.calledWith(calendar);
      expect(CalendarCollectionShellMock.toDavCalendar).to.have.been.calledWith(calendar);
    });

    it('should sync cache of list calendars', function(done) {
      CalendarCollectionShellFuncMock = angular.identity;
      var calendars = [{id: 1}, {id: 2}];

      this.$httpBackend.expectGET('/dav/api/calendars/homeId.json?withRights=true').respond({_embedded: {
        'dav:calendar': calendars
      }});
      this.$httpBackend.expectPOST('/dav/api/calendars/homeId.json').respond(201, {});

      this.calendarService.listCalendars('homeId').then(function() {
        var calendar = {id: 'calId'};

        CalendarCollectionShellMock.toDavCalendar = angular.identity;
        self.calendarService.createCalendar('homeId', calendar).then(function() {
          calendars.push(calendar);
          calendarsCacheMock.getList = sinon.stub().returns(calendars);

          self.calendarService.listCalendars('homeId').then(function(calendar) {
            expect(calendar).to.shallowDeepEqual({
              length: 3,
              2: {id: 'calId'}
            });
            done();
          });
        });
      });

      this.$httpBackend.flush();
      this.$rootScope.$digest();
    });

    it('should broadcast a CALENDARS.ADD event when the calendar has been created', function() {
      var calendar = {id: 'calId'};

      CalendarCollectionShellMock.toDavCalendar = sinon.spy(angular.identity);

      this.$httpBackend.expectPOST('/dav/api/calendars/homeId.json').respond(201, {});

      this.$rootScope.$broadcast = sinon.spy(angular.identity);

      this.calendarService.createCalendar('homeId', calendar).then(function() {});

      this.$httpBackend.flush();
      this.$rootScope.$digest();

      expect(self.$rootScope.$broadcast).to.have.been.calledWith(this.CAL_EVENTS.CALENDARS.ADD, calendar);
    });
  });

  describe('The modify calendar fn', function() {
    it('should send a put request to the correct URL and return resulting calendar', function() {
      var calendar = {id: 'calId'};

      CalendarCollectionShellMock.toDavCalendar = sinon.spy(angular.identity);

      this.$httpBackend.expect('PROPPATCH', '/dav/api/calendars/homeId/calId.json').respond(204, {});

      var promiseSpy = sinon.spy();

      this.calendarService.modifyCalendar('homeId', calendar).then(promiseSpy);

      this.$httpBackend.flush();
      this.$rootScope.$digest();

      expect(promiseSpy).to.have.been.calledWith(calendar);
      expect(CalendarCollectionShellMock.toDavCalendar).to.have.been.calledWith(calendar);
    });

    it('should sync cache of list calendars', function(done) {
      CalendarCollectionShellFuncMock = angular.identity;

      this.$httpBackend.expectGET('/dav/api/calendars/homeId.json?withRights=true').respond({_embedded: {
        'dav:calendar': [{id: 1}, {id: 'events', selected: true}]
      }});
      this.$httpBackend.expect('PROPPATCH', '/dav/api/calendars/homeId/events.json').respond(204, {});

      this.calendarService.listCalendars('homeId').then(function() {
        var calendar = {id: 'events', name: 'modified cal', selected: true};
        calendarsCacheMock.getList = sinon.stub().returns([{id: 1}, calendar]);

        CalendarCollectionShellMock.toDavCalendar = angular.identity;
        self.calendarService.modifyCalendar('homeId', calendar).then(function() {
          self.calendarService.listCalendars('homeId').then(function(calendar) {
            expect(calendar).to.shallowDeepEqual({
              length: 2,
              1: {id: 'events', name: 'modified cal', selected: true}
            });
            done();
          });
        });
      });

      this.$httpBackend.flush();
      this.$rootScope.$digest();
    });
  });

  describe('The modify rights fn', function() {
    it('should compute sharee dav diff and send it to sabre', function() {
      var davDiff = 'davDiff';
      var newCalendarShell = {
        toDAVShareRightsUpdate: sinon.stub().returns(davDiff)
      };
      var oldCalendarShell = {};

      this.calendarService.modifyRights('homeId', {id: 'calId'}, newCalendarShell, oldCalendarShell);

      expect(newCalendarShell.toDAVShareRightsUpdate).to.have.been.calledWith(sinon.match.same(oldCalendarShell));
      this.$httpBackend.expect('POST', '/dav/api/calendars/homeId/calId.json', davDiff).respond(200, {});
      this.$httpBackend.flush();
    });
  });

  describe('The subscription functions', function() {
    var calendarHomeId, subscription;

    beforeEach(function() {
      calendarHomeId = '1';
      subscription = {};
    });

    describe('The subscribe function', function() {
      it('should call subscription api service with right parameters', function(done) {
        var subscribeStub = sinon.stub(this.calCalendarSubscriptionApiService, 'subscribe', function() {
          return $q.when(subscription);
        });

        this.$rootScope.$broadcast = sinon.stub().returns({});
        CalendarCollectionShellMock.toDavCalendar = sinon.spy(angular.identity);

        this.calendarService.subscribe(calendarHomeId, subscription)
          .then(function() {
            expect(CalendarCollectionShellMock.toDavCalendar).to.have.been.calledWith(subscription);
            expect(subscribeStub).to.have.been.calledOnce;
            expect(self.$rootScope.$broadcast).to.have.been.calledWith(self.CAL_EVENTS.CALENDARS.ADD, subscription);
            done();
          }, done);

        this.$rootScope.$digest();
      });

      it('should reject when subscription api rejects', function(done) {
        var error = new Error('I failed');
        var subscribeStub = sinon.stub(this.calCalendarSubscriptionApiService, 'subscribe', function() {
          return $q.reject(error);
        });

        this.$rootScope.$broadcast = sinon.stub().returns({});
        CalendarCollectionShellMock.toDavCalendar = sinon.spy(angular.identity);

        this.calendarService.subscribe(calendarHomeId, subscription)
        .then(done, function(err) {
          expect(err.message).to.equal(error.message);
          expect(CalendarCollectionShellMock.toDavCalendar).to.have.been.calledWith(subscription);
          expect(subscribeStub).to.have.been.calledOnce;
          expect(self.$rootScope.$broadcast).to.not.have.been.called;
          done();
        });

        this.$rootScope.$digest();
      });
    });

    describe('The unsubscribe function', function() {
      it('should call subscription api service with right parameters', function(done) {
        var uniqueId = 'uniqueId';
        var unsubscribeStub = sinon.stub(this.calCalendarSubscriptionApiService, 'unsubscribe', function() {
          return $q.when(subscription);
        });
        CalendarCollectionShellMock.buildUniqueId = sinon.stub().returns(uniqueId);

        this.$rootScope.$broadcast = sinon.stub().returns({});
        this.calendarService.unsubscribe(calendarHomeId, subscription)
        .then(function(result) {
          expect(result).to.equal(subscription);
          expect(unsubscribeStub).to.have.been.calledWith(calendarHomeId, subscription.id);
          expect(self.$rootScope.$broadcast).to.have.been.calledWith(self.CAL_EVENTS.CALENDARS.REMOVE, {uniqueId: uniqueId});
          done();
        }, done);

        this.$rootScope.$digest();
      });

      it('should reject when subscription api rejects', function(done) {
        var error = new Error('I failed');
        var unsubscribeStub = sinon.stub(this.calCalendarSubscriptionApiService, 'unsubscribe', function() {
          return $q.reject(error);
        });

        this.$rootScope.$broadcast = sinon.stub().returns({});
        this.calendarService.unsubscribe(calendarHomeId, subscription)
        .then(done, function(err) {
          expect(err.message).to.equal(error.message);
          expect(unsubscribeStub).to.have.been.calledWith(calendarHomeId, subscription.id);
          expect(self.$rootScope.$broadcast).to.not.have.been.called;
          done();
        }, done);

        this.$rootScope.$digest();
      });
    });

    describe('The updateSubscription function', function() {
      it('should call subscription api service with right parameters', function(done) {
        var updateStub = sinon.stub(this.calCalendarSubscriptionApiService, 'update', function() {
          return $q.when();
        });

        this.$rootScope.$broadcast = sinon.stub().returns({});
        CalendarCollectionShellMock.toDavCalendar = sinon.spy(angular.identity);

        this.calendarService.updateSubscription(calendarHomeId, subscription)
        .then(function() {
          expect(CalendarCollectionShellMock.toDavCalendar).to.have.been.calledWith(subscription);
          expect(updateStub).to.have.been.calledOnce;
          expect(self.$rootScope.$broadcast).to.have.been.calledWith(self.CAL_EVENTS.CALENDARS.UPDATE, subscription);
          done();
        }, done);

        this.$rootScope.$digest();
      });

      it('should reject when subscription api rejects', function(done) {
        var error = new Error('I failed');
        var updateStub = sinon.stub(this.calCalendarSubscriptionApiService, 'update', function() {
          return $q.reject(error);
        });

        this.$rootScope.$broadcast = sinon.stub().returns({});
        CalendarCollectionShellMock.toDavCalendar = sinon.spy(angular.identity);

        this.calendarService.updateSubscription(calendarHomeId, subscription)
        .then(done, function(err) {
          expect(err.message).to.equal(error.message);
          expect(CalendarCollectionShellMock.toDavCalendar).to.have.been.calledWith(subscription);
          expect(updateStub).to.have.been.calledOnce;
          expect(self.$rootScope.$broadcast).to.not.have.been.called;
          done();
        }, done);

        this.$rootScope.$digest();
      });
    });
  });

  describe('The updateInviteStatus function', function() {
    var calendarHomeId, calendar, inviteStatus, modifySharesValue;

    beforeEach(function() {
      sinon.spy(this.$rootScope, '$broadcast');
      sinon.stub(this.calendarAPI, 'modifyShares', function() {
        return modifySharesValue;
      });

      calendarHomeId = '1';
      calendar = {};
      inviteStatus = { invitestatus: this.CAL_CALENDAR_SHARED_INVITE_STATUS.INVITE_ACCEPTED };
    });

    it('should call calendar api service with right parameters', function(done) {
      modifySharesValue = $q.when();

      this.calendarService
        .updateInviteStatus(calendarHomeId, calendar, inviteStatus)
        .then(function() {
          expect(self.calendarAPI.modifyShares).to.have.been.calledOnce;
          expect(self.$rootScope.$broadcast).to.have.been.calledWith(self.CAL_EVENTS.CALENDARS.ADD, calendar);

          done();
        }, done);

      this.$rootScope.$digest();
    });

    it('should reject when calendar api rejects', function(done) {
      var error = new Error('I failed');

      modifySharesValue = $q.reject(error);

      CalendarCollectionShellMock.toDavCalendar = sinon.spy(angular.identity);

      this.calendarService
        .updateInviteStatus(calendarHomeId, calendar, inviteStatus)
        .then(done, function(err) {
          expect(err.message).to.equal(error.message);
          expect(self.calendarAPI.modifyShares).to.have.been.calledOnce;
          expect(self.$rootScope.$broadcast).to.not.have.been.called;

          done();
        }, done);

      this.$rootScope.$digest();
    });
  });

  describe('The getOwnerDisplayName fn', function() {
    var owner = {
      name: 'User1'
    };
    var calendar;

    beforeEach(function() {
      calendar = {
        id: 'calendar1',
        getOwner: sinon.stub()
      };

      calendar.getOwner.returns($q.resolve(owner));
    });

    it('should call the getOwner function of the provided calendar and return its owner name, and should not call userUtils service if it is a resource', function(done) {
      calendar.isResource = function() { return true; };

      this.calendarService.getOwnerDisplayName(calendar).then(function(ownerDisplayName) {
        expect(calendar.getOwner).to.have.been.calledOnce;
        expect(ownerDisplayName).to.equal(owner.name);
        expect(userUtilsMock.displayNameOf).to.have.not.been.called;

        done();
      }).catch(function() { done(new Error('should not happen')); });

      this.$rootScope.$digest();
    });

    it('should call the getOwner function of the provided calendar and return its owner name, and call userUtils service if it is not a resource', function(done) {
      calendar.isResource = function() { return false; };
      userUtilsMock.displayNameOf.returns($q.resolve(owner.name));

      this.calendarService.getOwnerDisplayName(calendar).then(function(ownerDisplayName) {
        expect(calendar.getOwner).to.have.been.calledOnce;
        expect(ownerDisplayName).to.equal(owner.name);
        expect(userUtilsMock.displayNameOf).to.have.been.calledWith(owner);

        done();
      }).catch(function() { done(new Error('should not happen')); });

      this.$rootScope.$digest();
    });
  });

  describe('The injectCalendarsWithOwnerName fn', function() {
    var owner = {
      name: 'User1'
    };
    var calendars = [{ id: 'calendar1' }, { id: 'calendar2' }, { id: 'calendar3' }];

    it('should call the getOwnerDisplayName function as many times as the number of the provided calendars and return the equivalent calendars with their owner names injected', function(done) {
      var getOwnerDisplayNameCallCount = 0;

      calendars.forEach(function(calendar) {
        calendar.getOwner = sinon.spy(function() {
          getOwnerDisplayNameCallCount++;

          return $q.resolve(owner);
        });
        calendar.isResource = function() { return true; };
      });

      this.calendarService.injectCalendarsWithOwnerName(calendars).then(function(calendarsWithOwnerName) {
        expect(getOwnerDisplayNameCallCount).to.equal(calendars.length);
        expect(calendarsWithOwnerName).to.deep.equal(calendars.map(function(calendar) {
          return _.assign({}, calendar, { ownerDisplayName: owner.name });
        }));

        done();
      }).catch(function() { done(new Error('should not happen')); });

      this.$rootScope.$digest();
    });

    it('should call the getOwnerDisplayName function as many times as the number of the provided calendars and return the calendar(s) without their owner names injected if the request(s) fail', function(done) {
      var getOwnerDisplayNameCallCount = 0;

      calendars.forEach(function(calendar) {
        calendar.getOwner = sinon.spy(function() {
          getOwnerDisplayNameCallCount++;

          if (calendar.id === calendars[1].id) {
            return $q.reject('Request to get the calendar\'s owner has failed!');
          }

          return $q.resolve(owner);
        });
        calendar.isResource = function() { return true; };
      });

      this.calendarService.injectCalendarsWithOwnerName(calendars).then(function(calendarsWithOwnerName) {
        expect(getOwnerDisplayNameCallCount).to.equal(calendars.length);
        expect(calendarsWithOwnerName).to.deep.equal(calendars.map(function(calendar) {
          if (calendar.id === calendars[1].id) {
            return calendar;
          }

          return _.assign({}, calendar, { ownerDisplayName: owner.name });
        }));

        done();
      }).catch(function() { done(new Error('should not happen')); });

      this.$rootScope.$digest();
    });
  });
});
