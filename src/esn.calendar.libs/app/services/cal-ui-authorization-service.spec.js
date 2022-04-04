'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calUIAuthorizationService service', function() {
  var $rootScope, $q, calUIAuthorizationService, calEventUtils, userId, calDefaultValue;

  beforeEach(function() {
    calEventUtils = {
      isOrganizer: sinon.stub().returns(false)
    };

    userId = 'userId';

    angular.mock.module('esn.calendar.libs');

    angular.mock.module(function($provide) {
      $provide.value('calEventUtils', calEventUtils);
    });

    angular.mock.inject(function(_$rootScope_, _$q_, _calUIAuthorizationService_, _calEventUtils_, _calDefaultValue_) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      calUIAuthorizationService = _calUIAuthorizationService_;
      calEventUtils = _calEventUtils_;
      calDefaultValue = _calDefaultValue_;
    });
  });

  beforeEach(function() {
    calDefaultValue.set('calendarId', 'calendarId');
  });

  describe('The canAccessEventDetails function', function() {
    var calendar, event;

    beforeEach(function() {
      event = {
        isPublic: sinon.stub().returns(false)
      };

      calendar = {
        isOwner: sinon.stub().returns(false),
        isReadable: sinon.stub().returns(false)
      };

      userId = 'userId';
    });

    it('should return false if event is not public and event calendar is shared or delegated to the user', function() {
      var result = calUIAuthorizationService.canAccessEventDetails(calendar, event, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(event.isPublic).to.have.been.calledWith();
      expect(calendar.isReadable).to.not.have.been.called;
      expect(result).to.be.false;
    });

    it('should return false if event is public, event calendar is shared or delegated to the user but user does not have read rights on event calendar', function() {
      event.isPublic = sinon.stub().returns(true);

      var result = calUIAuthorizationService.canAccessEventDetails(calendar, event, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(event.isPublic).to.have.been.calledWith();
      expect(calendar.isReadable).to.have.been.calledWith(userId);
      expect(result).to.be.false;
    });

    it('should return true if event is public, event calendar is shared or delegated to the user and user have read rights on the calendar', function() {
      event.isPublic = sinon.stub().returns(true);
      calendar.isReadable = sinon.stub().returns(true);
      var result = calUIAuthorizationService.canAccessEventDetails(calendar, event, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(event.isPublic).to.have.been.calledWith();
      expect(calendar.isReadable).to.have.been.calledWith(userId);
      expect(result).to.be.true;
    });

    it('should return true if user is attendee or organizer of the event and event is on an user personal calendar', function() {
      calendar.isOwner = sinon.stub().returns(true);
      var result = calUIAuthorizationService.canAccessEventDetails(calendar, event, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(event.isPublic).to.not.have.been.called;
      expect(calendar.isReadable).to.not.have.been.called;
      expect(result).to.be.true;
    });
  });

  describe('The canExportCalendarIcs function', function() {
    var calendar;

    beforeEach(function() {
      userId = 'userId';
    });

    it('should return false if calendar is undefined', function() {
      expect(calUIAuthorizationService.canExportCalendarIcs()).to.be.false;
    });

    it('should return true if user have read rights on the calendar', function() {
      calendar = {
        isReadable: sinon.stub().returns(true)
      };
      var result = calUIAuthorizationService.canExportCalendarIcs(calendar, userId);

      expect(calendar.isReadable).to.have.been.calledWith(userId);
      expect(result).to.be.true;
    });

    it('should return false if user does not have read rights on the calendar', function() {
      calendar = {
        isReadable: sinon.stub().returns(false)
      };
      var result = calUIAuthorizationService.canExportCalendarIcs(calendar, userId);

      expect(calendar.isReadable).to.have.been.calledWith(userId);
      expect(result).to.be.false;
    });
  });

  describe('the canDeleteCalendar function', function() {
    it('should return false if calendar is undefined', function() {
      expect(calUIAuthorizationService.canDeleteCalendar()).to.be.false;
    });

    it('should return false if calendar.id is the same as calDefaultValue', function() {
      expect(calUIAuthorizationService.canDeleteCalendar({ id: calDefaultValue.get('calendarId') })).to.be.false;
    });

    it('should return false if the user is not the owner or the calendar is not shared to the user', function() {
      var calendar = {
        id: calDefaultValue.get('calendarId') + 'changed',
        isOwner: sinon.spy(function() {
          return false;
        }),
        isShared: sinon.spy(function() {
          return false;
        }),
        isSubscription: sinon.spy(function() {
          return false;
        })
      };
      var userId = 'userId';

      expect(calUIAuthorizationService.canDeleteCalendar(calendar, userId)).to.be.false;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calendar.isShared).to.have.been.calledWith(userId);
    });

    it('should return true for the non-default calendars when the user is the owner', function() {
      var calendar = {
        id: calDefaultValue.get('calendarId') + 'changed',
        isOwner: sinon.spy(function() {
          return true;
        }),
        isShared: sinon.spy(function() {
          return false;
        })
      };
      var userId = 'userId';

      expect(calUIAuthorizationService.canDeleteCalendar(calendar, userId)).to.be.true;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calendar.isShared).to.not.have.been.called;
    });

    it('should return true for the non-default calendars when the calendar is shared with the user', function() {
      var calendar = {
        id: calDefaultValue.get('calendarId') + 'changed',
        isOwner: sinon.spy(function() {
          return false;
        }),
        isShared: sinon.spy(function() {
          return true;
        })
      };
      var userId = 'userId';

      expect(calUIAuthorizationService.canDeleteCalendar(calendar, userId)).to.be.true;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calendar.isShared).to.have.been.calledWith(userId);
    });
  });

  describe('the canModifyCalendarProperties function', function() {
    it('should return false if calendar is undefined', function() {
      expect(calUIAuthorizationService.canModifyCalendarProperties()).to.be.false;
    });

    it('should return false if the user is not the owner or the calendar is not shared to the user', function() {
      var calendar = {
        isOwner: sinon.spy(function() {
          return false;
        }),
        isShared: sinon.spy(function() {
          return false;
        }),
        isSubscription: sinon.spy(function() {
          return false;
        })
      };
      var userId = 'userId';

      expect(calUIAuthorizationService.canModifyCalendarProperties(calendar, userId)).to.be.false;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calendar.isShared).to.have.been.calledWith(userId);
    });

    it('should return true for the non-default calendars when the user is the owner', function() {
      var calendar = {
        isOwner: sinon.spy(function() {
          return true;
        }),
        isShared: sinon.spy(function() {
          return false;
        })
      };
      var userId = 'userId';

      expect(calUIAuthorizationService.canModifyCalendarProperties(calendar, userId)).to.be.true;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calendar.isShared).to.not.have.been.called;
    });

    it('should return true for the non-default calendars when the calendar is shared with the user', function() {
      var calendar = {
        isOwner: sinon.spy(function() {
          return false;
        }),
        isShared: sinon.spy(function() {
          return true;
        })
      };
      var userId = 'userId';

      expect(calUIAuthorizationService.canModifyCalendarProperties(calendar, userId)).to.be.true;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calendar.isShared).to.have.been.calledWith(userId);
    });

    it('should return true for the non-default calendars when the calendar is a subscription', function() {
      var calendar = {
        isOwner: sinon.spy(function() {
          return false;
        }),
        isShared: sinon.spy(function() {
          return false;
        }),
        isSubscription: sinon.spy(function() {
          return true;
        })
      };
      var userId = 'userId';

      expect(calUIAuthorizationService.canModifyCalendarProperties(calendar, userId)).to.be.true;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calendar.isShared).to.have.been.calledWith(userId);
      expect(calendar.isSubscription).to.have.been.calledWith();
    });
  });

  describe('the canModifyEvent function', function() {
    var calendar, event, userId;

    beforeEach(function() {
      calendar = {
        getOwner: sinon.spy(),
        isWritable: sinon.spy()
      };

      event = {
        event: 'event',
        organizer: {
          email: 'user@email.com'
        }
      };
      userId = 'userId';
    });

    it('should return false if event is undefined', function(done) {
      calEventUtils.isNew = sinon.spy();

      calUIAuthorizationService.canModifyEvent(calendar, undefined, userId)
        .then(function(canModifyEvent) {
          expect(canModifyEvent).to.be.false;
          expect(calEventUtils.isNew).to.not.have.been.called;
          expect(calendar.getOwner).to.not.have.been.called;
          expect(calEventUtils.isOrganizer).to.not.have.been.called;
          expect(calendar.isWritable).to.not.have.been.called;
          done();
        }).catch(done);

      $rootScope.$digest();
    });

    it('should return false if user want to modify event, event organizer is not the owner of the event calendar and user can modify it', function(done) {
      calEventUtils.isNew = sinon.stub().returns(false);
      calendar.isWritable = sinon.stub().returns(false);
      calendar.getOwner = sinon.stub().returns($q.when({ emails: ['otherUser@email.com'] }));

      calUIAuthorizationService.canModifyEvent(calendar, event, userId)
        .then(function(canModifyEvent) {
          expect(canModifyEvent).to.be.false;
          expect(calEventUtils.isNew).to.have.been.calledWith(event);
          expect(calendar.getOwner).to.have.been.calledWith();
          expect(calEventUtils.isOrganizer).to.have.been.called;
          expect(calendar.isWritable).to.not.have.been.called;

          done();
        }).catch(done);

      $rootScope.$digest();
    });

    it('should return false if user want to modify event, event organizer is the owner of the event calendar and user cannot modify it', function(done) {
      calEventUtils.isNew = sinon.stub().returns(false);
      calEventUtils.isOrganizer = sinon.stub().returns(false);
      calendar.isWritable = sinon.stub().returns(false);
      calendar.getOwner = sinon.stub().returns($q.when({ emails: ['user@email.com'] }));

      calUIAuthorizationService.canModifyEvent(calendar, event, userId)
        .then(function(canModifyEvent) {
          expect(canModifyEvent).to.be.false;
          expect(calEventUtils.isNew).to.have.been.calledWith(event);
          expect(calendar.getOwner).to.have.been.calledWith();
          expect(calEventUtils.isOrganizer).to.have.been.called;
          expect(calendar.isWritable).to.not.have.been.called;

          done();
        }).catch(done);

      $rootScope.$digest();
    });

    it('should return true if new event', function(done) {
      calEventUtils.isNew = sinon.stub().returns(true);

      calUIAuthorizationService.canModifyEvent(calendar, event, userId)
        .then(function(canModifyEvent) {
          expect(canModifyEvent).to.be.true;
          expect(calEventUtils.isNew).to.have.been.calledWith(event);
          expect(calendar.getOwner).to.not.have.been.called;
          expect(calEventUtils.isOrganizer).to.not.have.been.called;
          expect(calendar.isWritable).to.not.have.been.called;

          done();
        }).catch(done);

      $rootScope.$digest();
    });

    it('should return true if user want to modify event, event organizer is the owner of the event calendar and user can modify it', function(done) {
      calEventUtils.isNew = sinon.stub().returns(false);
      calEventUtils.isOrganizer = sinon.stub().returns(true);
      calendar.isWritable = sinon.stub().returns(true);
      calendar.getOwner = sinon.stub().returns($q.when({ emails: ['user@email.com'] }));

      calUIAuthorizationService.canModifyEvent(calendar, event, userId)
        .then(function(canModifyEvent) {
          expect(canModifyEvent).to.be.true;
          expect(calEventUtils.isNew).to.have.been.calledWith(event);
          expect(calendar.getOwner).to.have.been.calledWith();
          expect(calEventUtils.isOrganizer).to.have.been.called;
          expect(calendar.isWritable).to.have.been.calledWith();

          done();
        }).catch(done);

      $rootScope.$digest();
    });
  });

  describe('the canModifyEventRecurrence function', function() {
    var calendar, event, userId;

    beforeEach(function() {
      calendar = {
        getOwner: sinon.spy(),
        isWritable: sinon.spy()
      };

      event = {
        event: 'event',
        organizer: {
          email: 'user@email.com'
        }
      };
      userId = 'userId';
    });

    it('should return false if event is undefined', function(done) {
      calUIAuthorizationService.canModifyEventRecurrence(calendar, undefined, userId)
        .then(function(canModifyEventRecurrence) {
          expect(canModifyEventRecurrence).to.be.false;
          expect(calendar.getOwner).to.not.have.been.called;
          expect(calendar.isWritable).to.not.have.been.called;
          expect(calEventUtils.isOrganizer).to.not.have.been.called;
          done();
        }).catch(done);

      $rootScope.$digest();
    });

    it('should return false if event is a recurring event instance', function(done) {
      event.isInstance = sinon.stub().returns(true);
      calendar.isWritable = sinon.stub().returns(false);
      calendar.getOwner = sinon.stub().returns($q.when({ emails: ['otherUser@email.com'] }));

      calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)
        .then(function(canModifyEventRecurrence) {
          expect(canModifyEventRecurrence).to.be.false;
          expect(event.isInstance).to.have.been.calledWith();
          expect(calendar.getOwner).to.not.have.been.called;
          expect(calendar.isWritable).to.not.have.been.called;
          expect(calEventUtils.isOrganizer).to.not.have.been.called;

          done();
        }).catch(done);

      $rootScope.$digest();
    });

    describe('Event is not a recurring instance', function() {
      beforeEach(function() {
        event.isInstance = sinon.stub().returns(false);
      });

      it('should return false if event organizer is not the owner of the event calendar although user can modify it', function(done) {
        calEventUtils.isOrganizer = sinon.stub().returns(false);
        calendar.isWritable = sinon.stub().returns(true);
        calendar.getOwner = sinon.stub().returns($q.when({ emails: ['otherUser@email.com'] }));

        calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)
          .then(function(canModifyEventRecurrence) {
            expect(canModifyEventRecurrence).to.be.false;
            expect(event.isInstance).to.have.been.calledWith();
            expect(calendar.isWritable).to.not.have.been.called;
            expect(calendar.getOwner).to.have.been.calledWith();
            expect(calEventUtils.isOrganizer).to.have.been.called;

            done();
          }).catch(done);

        $rootScope.$digest();
      });

      it('should return false if event organizer is the owner of the event calendar but user cannot modify it', function(done) {
        calEventUtils.isOrganizer = sinon.stub().returns(true);
        calendar.isWritable = sinon.stub().returns(false);
        calendar.getOwner = sinon.stub().returns($q.when({ emails: ['user@email.com'] }));

        calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)
          .then(function(canModifyEventRecurrence) {
            expect(canModifyEventRecurrence).to.be.false;
            expect(event.isInstance).to.have.been.calledWith();
            expect(calendar.isWritable).to.have.been.calledWith();
            expect(calendar.getOwner).to.have.been.calledWith();
            expect(calEventUtils.isOrganizer).to.have.been.called;

            done();
          }).catch(done);

        $rootScope.$digest();
      });

      it('should return true if event organizer is the owner of the event calendar and user can modify it', function(done) {
        calEventUtils.isOrganizer = sinon.stub().returns(true);
        calendar.isWritable = sinon.stub().returns(true);
        calendar.getOwner = sinon.stub().returns($q.when({ emails: ['user@email.com'] }));

        calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)
          .then(function(canModifyEventRecurrence) {
            expect(canModifyEventRecurrence).to.be.true;
            expect(event.isInstance).to.have.been.calledWith();
            expect(calendar.isWritable).to.have.been.calledWith();
            expect(calendar.getOwner).to.have.been.calledWith();
            expect(calEventUtils.isOrganizer).to.have.been.called;

            done();
          }).catch(done);

        $rootScope.$digest();
      });
    });
  });

  describe('the canModifyPublicSelection function', function() {
    var calendar;

    it('should return false if calendar is undefined', function() {
      expect(calUIAuthorizationService.canModifyPublicSelection()).to.be.false;
    });

    it('should call calendar.isAdmin with userId', function() {
      calendar = {
        isAdmin: sinon.stub().returns(true),
        isSubscription: sinon.stub().returns(false)
      };

      expect(calUIAuthorizationService.canModifyPublicSelection(calendar, userId)).to.be.true;
      expect(calendar.isAdmin).to.have.been.calledWith(userId);
    });

    it('should call calendar.isSubscription', function() {
      calendar = {
        isAdmin: sinon.stub().returns(true),
        isSubscription: sinon.stub().returns(false)
      };

      expect(calUIAuthorizationService.canModifyPublicSelection(calendar, userId)).to.be.true;
      expect(calendar.isSubscription).to.have.been.calledWith();
    });
  });

  describe('the canMoveEvent function', function() {
    var calendar, userId = 'userId';

    it('should return false if user is not the owner of the calendar', function() {
      calendar = {
        isOwner: sinon.stub().returns(false)
      };
      const result = calUIAuthorizationService.canMoveEvent(calendar, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(result).to.be.false;
    });

    it('should return true if user is the owner of the calendar', function() {
      calendar = {
        isOwner: sinon.stub().returns(true)
      };
      const result = calUIAuthorizationService.canMoveEvent(calendar, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(result).to.be.true;
    });
  });

  describe('the canShowDelegationTab function', function() {
    var calendar;

    it('should return false if calendar is undefined', function() {
      expect(calUIAuthorizationService.canShowDelegationTab()).to.be.false;
    });

    it('should call calendar.isAdmin with userId', function() {
      calendar = {
        isAdmin: sinon.stub().returns(true),
        isSubscription: sinon.stub().returns(false)
      };

      expect(calUIAuthorizationService.canShowDelegationTab(calendar, userId)).to.be.true;
      expect(calendar.isAdmin).to.have.been.calledWith(userId);
    });

    it('should call calendar.isSubscription', function() {
      calendar = {
        isAdmin: sinon.stub().returns(true),
        isSubscription: sinon.stub().returns(false)
      };

      expect(calUIAuthorizationService.canShowDelegationTab(calendar, userId)).to.be.true;
      expect(calendar.isSubscription).to.have.been.calledWith();
    });
  });

  describe('The canImportCalendarIcs function', function() {
    let calendar;

    beforeEach(function() {
      userId = 'userId';
    });

    it('should return false if calendar is undefined', function() {
      expect(calUIAuthorizationService.canImportCalendarIcs()).to.be.false;
    });

    it('should return false if user is not the owner of the calendar', function() {
      calendar = {
        isOwner: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(false)
      };
      const result = calUIAuthorizationService.canImportCalendarIcs(calendar, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calendar.isSubscription).to.not.have.been.called;
      expect(result).to.be.false;
    });

    describe('When user is the owner is the calendar', function() {
      beforeEach(function() {
        calendar = {
          isOwner: sinon.stub().returns(true)
        };
      });

      it('should return false if calendar is a subscription instance', function() {
        calendar.isSubscription = sinon.stub().returns(true);
        const result = calUIAuthorizationService.canImportCalendarIcs(calendar, userId);

        expect(calendar.isOwner).to.have.been.calledWith(userId);
        expect(calendar.isSubscription).to.have.been.calledOnce;
        expect(result).to.be.false;
      });

      it('should return true if calendar is not a subscription instance', function() {
        calendar.isSubscription = sinon.stub().returns(false);
        const result = calUIAuthorizationService.canImportCalendarIcs(calendar, userId);

        expect(calendar.isOwner).to.have.been.calledWith(userId);
        expect(calendar.isSubscription).to.have.been.calledOnce;
        expect(result).to.be.true;
      });
    });
  });
});
