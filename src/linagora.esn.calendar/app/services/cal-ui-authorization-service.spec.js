'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calUIAuthorizationService service', function() {
  var calUIAuthorizationService, calEventUtils, userId, calDefaultValue, CAL_CALENDAR_PUBLIC_RIGHT, CAL_CALENDAR_SHARED_RIGHT;

  beforeEach(function() {
    calEventUtils = {
      isOrganizer: sinon.stub().returns(false)
    };

    userId = 'userId';

    angular.mock.module('esn.calendar');

    angular.mock.module(function($provide) {
      $provide.value('calEventUtils', calEventUtils);
    });

    angular.mock.inject(function(___, _calUIAuthorizationService_, _calEventUtils_, _calDefaultValue_, _CAL_CALENDAR_PUBLIC_RIGHT_, _CAL_CALENDAR_SHARED_RIGHT_) {
      calUIAuthorizationService = _calUIAuthorizationService_;
      calEventUtils = _calEventUtils_;
      calDefaultValue = _calDefaultValue_;
      CAL_CALENDAR_PUBLIC_RIGHT = _CAL_CALENDAR_PUBLIC_RIGHT_;
      CAL_CALENDAR_SHARED_RIGHT = _CAL_CALENDAR_SHARED_RIGHT_;
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
      expect(event.isPublic).to.have.been.calledWith;
      expect(calendar.isReadable).to.not.have.been.called;
      expect(result).to.be.false;
    });

    it('should return false if event is public, event calendar is shared or delegated to the user but user does not have read rights on event calendar', function() {
      event.isPublic = sinon.stub().returns(true);

      var result = calUIAuthorizationService.canAccessEventDetails(calendar, event, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(event.isPublic).to.have.been.calledWith;
      expect(calendar.isReadable).to.have.been.calledWith(userId);
      expect(result).to.be.false;
    });

    it('should return true if event is public, event calendar is shared or delegated to the user and user have read rights on the calendar', function() {
      event.isPublic = sinon.stub().returns(true);
      calendar.isReadable = sinon.stub().returns(true);
      var result = calUIAuthorizationService.canAccessEventDetails(calendar, event, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(event.isPublic).to.have.been.calledWith;
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
      expect(calUIAuthorizationService.canDeleteCalendar({id: calDefaultValue.get('calendarId')})).to.be.false;
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
    var calendar, event, userId, publicRight, shareeRight, isOwner;

    beforeEach(function() {
      calendar = {
        isOwner: sinon.spy(function() {
          return isOwner;
        }),
        rights: {
          getPublicRight: sinon.spy(function() {
            return publicRight;
          }),
          getShareeRight: sinon.spy(function() {
            return shareeRight;
          })
        }
      };

      publicRight = CAL_CALENDAR_PUBLIC_RIGHT.READ;
      shareeRight = CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ;

      event = {
        event: 'event'
      };
      userId = 'userId';

      calEventUtils.isNew = sinon.stub().returns(false);
    });

    describe('user own calendar', function() {
      beforeEach(function() {
        isOwner = true;

        publicRight = CAL_CALENDAR_PUBLIC_RIGHT.PRIVATE;
        shareeRight = CAL_CALENDAR_SHARED_RIGHT.SHAREE_OWNER;
      });

      it('should return true if new event', function() {
        calEventUtils.isNew = sinon.stub().returns(true);

        expect(calUIAuthorizationService.canModifyEvent(calendar, event, userId)).to.be.true;
        expect(calEventUtils.isNew).to.have.been.calledWith(event);
      });

      it('should return true if user is event organizer', function() {
        calEventUtils.isOrganizer = sinon.stub().returns(true);

        expect(calUIAuthorizationService.canModifyEvent(calendar, event, userId)).to.be.true;
        expect(calendar.isOwner).to.have.been.calledWith(userId);
        expect(calEventUtils.isOrganizer).to.have.been.calledWith(event);
        expect(calendar.rights.getPublicRight).to.have.been.calledWith;
        expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      });

      it('should return false if not new event and user is attendee', function() {
        expect(calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)).to.be.false;
        expect(calendar.isOwner).to.have.been.calledWith(userId);
        expect(calEventUtils.isOrganizer).to.have.been.calledWith(event);
        expect(calendar.rights.getPublicRight).to.have.been.calledWith;
        expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      });

      it('should return false if not new event and user is attendee (even if user has added public write rights', function() {
        publicRight = CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE;

        expect(calUIAuthorizationService.canModifyEvent(calendar, event, userId)).to.be.true;
        expect(calendar.isOwner).to.have.been.calledWith(userId);
        expect(calEventUtils.isOrganizer).to.have.been.calledWith(event);
        expect(calendar.rights.getPublicRight).to.have.been.calledWith;
        expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      });
    });

    describe('calendar shared to the user', function() {
      beforeEach(function() {
        isOwner = false;

        publicRight = CAL_CALENDAR_PUBLIC_RIGHT.READ;
        shareeRight = CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ;
      });

      it('should return false if user has no write rights on the calendar', function() {
        expect(calUIAuthorizationService.canModifyEvent(calendar, event, userId)).to.be.false;
        expect(calendar.isOwner).to.have.been.calledWith(userId);
        expect(calEventUtils.isOrganizer).to.not.have.been.called;
        expect(calendar.rights.getPublicRight).to.have.been.calledWith;
        expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      });

      it('should return true if user has public write rights on the calendar', function() {
        publicRight = CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE;

        expect(calUIAuthorizationService.canModifyEvent(calendar, event, userId)).to.be.true;
        expect(calendar.isOwner).to.have.been.calledWith(userId);
        expect(calEventUtils.isOrganizer).to.not.have.been.called;
        expect(calendar.rights.getPublicRight).to.have.been.calledWith;
        expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      });

      it('should return true if user is attendee of the event and but user have sharee write rights on the calendar', function() {
        shareeRight = CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE;

        expect(calUIAuthorizationService.canModifyEvent(calendar, event, userId)).to.be.true;
        expect(calendar.isOwner).to.have.been.calledWith(userId);
        expect(calEventUtils.isOrganizer).to.not.have.been.called;
        expect(calendar.rights.getPublicRight).to.have.been.calledWith;
        expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      });

      it('should return true if user is attendee of the event and but user have sharee admin rights on the calendar', function() {
        shareeRight = CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN;

        expect(calUIAuthorizationService.canModifyEvent(calendar, event, userId)).to.be.true;
        expect(calendar.isOwner).to.have.been.calledWith(userId);
        expect(calEventUtils.isOrganizer).to.not.have.been.called;
        expect(calendar.rights.getPublicRight).to.have.been.calledWith;
        expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      });
    });
  });

  describe('the canModifyEventAttendees function', function() {
    var calendar, event, userId;

    beforeEach(function() {
      calEventUtils.isOrganizer = sinon.stub().returns(false);
      calendar = {
        isOwner: sinon.stub().returns(false),
        isWritable: sinon.stub().returns(false),
        isShared: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(false)
      };

      event = 'event';
      userId = 'userId';
    });

    it('should return false if current user is not the event organizer', function() {
      calendar.isOwner = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventAttendees(calendar, event, userId)).to.be.false;
    });

    it('should return false if current user is the event organizer but event is not on user personal calendar', function() {
      calEventUtils.isOrganizer = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventAttendees(calendar, event, userId)).to.be.false;
    });

    it('should return true if current user is the event organizer and event is not on user personal calendar', function() {
      calEventUtils.isOrganizer = sinon.stub().returns(true);
      calendar.isOwner = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventAttendees(calendar, event, userId)).to.be.true;
    });

    it('should return false if event is a invitation event on user personal calendar', function() {
      calendar.isWritable = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventAttendees(calendar, event, userId)).to.be.false;
    });

    it('should return false if current user is a sharee but not have writable permission', function() {
      calendar.isShared = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventAttendees(calendar, event, userId)).to.be.false;
    });

    it('should return true if current user is a sharee and have writable permission', function() {
      calendar.isWritable = sinon.stub().returns(true);
      calendar.isShared = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventAttendees(calendar, event, userId)).to.be.true;
    });

    it('should return false if calendar is subscription but does not have write public permission', function() {
      calendar.isSubscription = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventAttendees(calendar, event, userId)).to.be.false;
    });

    it('should return true if calendar is subscription and have write public permission', function() {
      calendar.isSubscription = sinon.stub().returns(true);
      calendar.isWritable = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventAttendees(calendar, event, userId)).to.be.true;
    });
  });

  describe('the canModifyEventRecurrence function', function() {
    var calendar, event, userId, publicRight, shareeRight;

    beforeEach(function() {
      calendar = {
        isOwner: sinon.stub().returns(false),
        rights: {
          getPublicRight: sinon.spy(function() {
            return publicRight;
          }),
          getShareeRight: sinon.spy(function() {
            return shareeRight;
          })
        }
      };

      publicRight = CAL_CALENDAR_PUBLIC_RIGHT.READ;
      shareeRight = CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ;

      event = {
        isInstance: sinon.stub().returns(false)
      };

      userId = 'userId';
    });

    it('should return false if user is attendee and user does not have write rights on event calendar', function() {
      expect(calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)).to.be.false;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calEventUtils.isOrganizer).to.not.have.been.called;
      expect(calendar.rights.getPublicRight).to.have.been.calledWith;
      expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      expect(event.isInstance).to.have.been.calledWith;
    });

    it('should return false if user is organizer but not owner of event calendar and user does not have write rights on event calendar', function() {
      calEventUtils.isOrganizer = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)).to.be.false;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calEventUtils.isOrganizer).to.not.have.been.called;
      expect(calendar.rights.getPublicRight).to.have.been.calledWith;
      expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      expect(event.isInstance).to.have.been.calledWith;
    });

    it('should return false user is attendee and user can modify event but event is instance of recurrent event', function() {
      calEventUtils.isOrganizer = sinon.stub().returns(true);
      calendar.isOwner = sinon.stub().returns(true);
      event.isInstance = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)).to.be.false;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calEventUtils.isOrganizer).to.have.been.calledWith(event);
      expect(calendar.rights.getPublicRight).to.have.been.calledWith;
      expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      expect(event.isInstance).to.have.been.calledWith;
    });

    it('should return true if user is event organizer', function() {
      calEventUtils.isOrganizer = sinon.stub().returns(true);
      calendar.isOwner = sinon.stub().returns(true);

      expect(calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)).to.be.true;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calEventUtils.isOrganizer).to.have.been.calledWith(event);
      expect(event.isInstance).to.have.been.calledWith;
    });

    it('should return true if user is attendee of the event and but user have public write rights on the calendar', function() {
      publicRight = CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE;

      expect(calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)).to.be.true;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calEventUtils.isOrganizer).to.not.have.been.called;
      expect(calendar.rights.getPublicRight).to.have.been.calledWith;
      expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      expect(event.isInstance).to.have.been.calledWith;
    });

    it('should return true if user is attendee of the event and but user have sharee write rights on the calendar', function() {
      shareeRight = CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE;

      expect(calUIAuthorizationService.canModifyEventRecurrence(calendar, event, userId)).to.be.true;
      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(calEventUtils.isOrganizer).to.not.have.been.called;
      expect(calendar.rights.getPublicRight).to.have.been.calledWith;
      expect(calendar.rights.getShareeRight).to.have.been.calledWith(userId);
      expect(event.isInstance).to.have.been.calledWith;
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
    var calendar;

    beforeEach(function() {
      userId = 'userId';
    });

    it('should return false if calendar is undefined', function() {
      expect(calUIAuthorizationService.canImportCalendarIcs()).to.be.false;
    });

    it('should return true if user is the owner of the calendar', function() {
      calendar = {
        isOwner: sinon.stub().returns(true),
        isReadable: sinon.stub().returns(true),
        isSubscription: sinon.stub().returns(false),
        isPublic: sinon.stub().returns(false)
      };
      var result = calUIAuthorizationService.canImportCalendarIcs(calendar, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(result).to.be.true;
    });

    it('should return false if user is not the owner of the calendar', function() {
      calendar = {
        isOwner: sinon.stub().returns(false),
        isReadable: sinon.stub().returns(false),
        isSubscription: sinon.stub().returns(false),
        isPublic: sinon.stub().returns(false)
      };
      var result = calUIAuthorizationService.canImportCalendarIcs(calendar, userId);

      expect(calendar.isOwner).to.have.been.calledWith(userId);
      expect(result).to.be.false;
    });
  });
});
