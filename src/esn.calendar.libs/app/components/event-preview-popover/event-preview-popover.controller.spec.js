'use strict';

/* global chai, sinon */

const { expect } = chai;

describe('The CalEventPreviewPopoverController', function() {
  let $rootScope, $controller, session;
  let $modalMock, calEventPreviewPopoverServiceMock, calOpenEventFormMock, calendarServiceMock, calEventServiceMock,
    calEventDuplicateServiceMock, calPartstatUpdateNotificationServiceMock, notificationFactoryMock, calAttendeeServiceMock,
    calEventUtilsMock, urlUtilsMock, calUIAuthorizationServiceMock;
  let scope, initController, sessionUser;

  beforeEach(function() {
    calEventPreviewPopoverServiceMock = {
      close: sinon.stub()
    };

    calOpenEventFormMock = sinon.stub();

    calendarServiceMock = {
      getCalendar: sinon.stub().returns($q.when({ id: 'calendarId', calendarHomeId: 'calendarHomeId', getOwner: () => $q.when({ id: 'owner' }) }))
    };

    calEventServiceMock = {
      removeEvent: sinon.stub()
    };

    calEventDuplicateServiceMock = {
      duplicateEvent: sinon.stub().returns($q.when({ uid: 'duplicated-event' }))
    };

    calPartstatUpdateNotificationServiceMock = sinon.stub();

    notificationFactoryMock = {
      weakError: sinon.stub()
    };

    calAttendeeServiceMock = {
      splitAttendeesFromType: sinon.stub(),
      getAttendeeForUser: sinon.stub()
    };

    calEventUtilsMock = {
      getEmailAddressesFromAttendeesExcludingCurrentUser: sinon.stub().returns('')
    };

    urlUtilsMock = {
      isValidURL: sinon.stub().returns(true),
      isAbsoluteURL: sinon.stub().returns(true)
    };

    calUIAuthorizationServiceMock = {
      canModifyEvent: sinon.stub().returns(true)
    };

    $modalMock = sinon.stub();

    sessionUser = {
      _id: 'user_id'
    };

    angular.mock.module('esn.resource.libs');
    angular.mock.module('esn.calendar.libs');
    angular.mock.module(function($provide) {
      $provide.value('calEventPreviewPopoverService', calEventPreviewPopoverServiceMock);
      $provide.value('calOpenEventForm', calOpenEventFormMock);
      $provide.value('calendarService', calendarServiceMock);
      $provide.value('calEventService', calEventServiceMock);
      $provide.value('calEventDuplicateService', calEventDuplicateServiceMock);
      $provide.value('calPartstatUpdateNotificationService', calPartstatUpdateNotificationServiceMock);
      $provide.value('notificationFactory', notificationFactoryMock);
      $provide.value('calAttendeeService', calAttendeeServiceMock);
      $provide.value('calEventUtils', calEventUtilsMock);
      $provide.value('calUIAuthorizationService', calUIAuthorizationServiceMock);
      $provide.value('urlUtils', urlUtilsMock);
      $provide.value('$modal', $modalMock);
    });

    angular.mock.inject(function(_$rootScope_, _$controller_, _session_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      session = _session_;

      session.user = sessionUser;
    });
  });

  beforeEach(function() {
    initController = function(bindings) {
      scope = $rootScope.$new();
      scope.$watch = sinon.stub();

      const controller = $controller('CalEventPreviewPopoverController', {
        $rootScope: $rootScope,
        $scope: scope
      }, bindings);

      $rootScope.$digest();

      return controller;
    };
  });

  describe('The $scope.$watch for event changes', function() {
    let event, controller;

    beforeEach(function() {
      event = {
        uid: 'event',
        attendees: [{ email: 'attendee1@mail.test' }, { email: 'attendee2@mail.test' }],
        location: 'https://test.com',
        calendarHomeId: 'calendarHomeId',
        calendarId: 'calendarId'
      };
    });

    it('should set attendee email addresses', function() {
      controller = initController({ event });

      expect(scope.$watch).to.have.been.calledTwice;

      const detectChangeFunction = scope.$watch.getCall(0).args[0];
      const listener = scope.$watch.getCall(0).args[1];

      expect(detectChangeFunction()).to.equal(controller.event);

      const emailAddresses = 'attendee1@mail.test, attendee2@mail.test';

      calEventUtilsMock.getEmailAddressesFromAttendeesExcludingCurrentUser = sinon.stub().returns(emailAddresses);

      listener();

      expect(calEventUtilsMock.getEmailAddressesFromAttendeesExcludingCurrentUser).to.have.been.calledWith(controller.event.attendees);
      expect(controller.attendeeEmailAddresses).to.equal(emailAddresses);
    });

    it('should set the variables to check if location is a valid & absolute URL', function() {
      controller = initController({ event });

      expect(scope.$watch).to.have.been.calledTwice;

      const detectChangeFunction = scope.$watch.getCall(0).args[0];
      const listener = scope.$watch.getCall(0).args[1];

      expect(detectChangeFunction()).to.equal(controller.event);

      listener();

      expect(urlUtilsMock.isValidURL).to.have.been.calledWith(controller.event.location);
      expect(urlUtilsMock.isAbsoluteURL).to.have.been.calledWith(controller.event.location);
      expect(controller.isLocationAWebURL).to.be.true;
      expect(controller.isLocationAnAbsoluteURL).to.be.true;
    });

    it('should fetch calendar and rights', function() {
      const owner = { id: 'owner' };
      const userAttendee = { id: 'calendarHomeId', email: 'attendee1@mail.test' };
      const calendar = {
        id: 'calendarId', calendarHomeId: 'calendarHomeId', getOwner: () => $q.when(owner), readOnly: false
      };

      calendarServiceMock.getCalendar = sinon.stub().returns($q.when(calendar));
      calAttendeeServiceMock.getAttendeeForUser = sinon.stub().returns(userAttendee);

      controller = initController({ event });

      expect(scope.$watch).to.have.been.calledTwice;

      const detectChangeFunction = scope.$watch.getCall(0).args[0];
      const listener = scope.$watch.getCall(0).args[1];

      expect(detectChangeFunction()).to.equal(controller.event);

      listener();

      expect(calendarServiceMock.getCalendar).to.have.been.calledWith(controller.event.calendarHomeId, controller.event.calendarId);

      $rootScope.$digest();

      expect(controller.calendar).to.equal(calendar);

      $rootScope.$digest();

      expect(calAttendeeServiceMock.getAttendeeForUser).to.have.been.calledWith(controller.event.attendees, owner);
      expect(controller.calendarOwnerAsAttendee).to.equal(userAttendee);

      $rootScope.$digest();

      expect(calUIAuthorizationServiceMock.canModifyEvent).to.have.been.calledWith(controller.calendar, controller.event, sessionUser._id);
      expect(controller.canModifyEvent).to.be.true;
      expect(controller.isReadOnly).to.equal(calendar.readOnly);
    });

    it('should do nothing when event is not present', function() {
      initController();

      expect(scope.$watch).to.have.been.calledTwice;

      const detectChangeFunction = scope.$watch.getCall(0).args[0];
      const listener = scope.$watch.getCall(0).args[1];

      expect(detectChangeFunction()).to.be.undefined;

      listener();

      expect(calEventUtilsMock.getEmailAddressesFromAttendeesExcludingCurrentUser).to.have.not.been.called;
      expect(urlUtilsMock.isValidURL).to.have.not.been.called;
      expect(urlUtilsMock.isAbsoluteURL).to.have.not.been.called;
      expect(calendarServiceMock.getCalendar).to.have.not.been.called;
    });
  });

  describe('The $scope.$watch for changes in event attendees', function() {
    it('should set attendees and resources and put the organizer first in the list', function() {
      const event = {
        uid: 'event',
        attendees: [{ email: 'attendee1@mail.test' }, { email: 'organizer@mail.test' }, { email: 'attendee2@mail.test' }],
        location: 'https://test.com',
        calendarHomeId: 'calendarHomeId',
        calendarId: 'calendarId',
        organizer: { email: 'organizer@mail.test' }
      };
      const splitAttendeesResult = {
        resources: [],
        users: event.attendees
      };

      calAttendeeServiceMock.splitAttendeesFromType = sinon.stub().returns(splitAttendeesResult);

      const controller = initController({ event });

      expect(scope.$watch).to.have.been.calledTwice;

      const detectChangeFunction = scope.$watch.getCall(1).args[0];
      const listener = scope.$watch.getCall(1).args[1];

      expect(detectChangeFunction()).to.be.equal(controller.event.attendees);

      listener();

      expect(calAttendeeServiceMock.splitAttendeesFromType).to.have.been.calledWith(controller.event.attendees);
      expect(controller.resources).to.deep.equal(splitAttendeesResult.resources);
      expect(controller.attendees).to.deep.equal([{ email: 'organizer@mail.test' }, { email: 'attendee1@mail.test' }, { email: 'attendee2@mail.test' }]);
    });
  });

  describe('The openEventForm method', function() {
    it('should close the popover and open the event form', function() {
      const eventClone = { calendarHomeId: 'calendarHomeId' };
      const event = { calendarHomeId: 'calendarHomeId', clone: () => eventClone };
      const controller = initController({ event });

      controller.openEventForm();

      expect(calEventPreviewPopoverServiceMock.close).to.have.been.called;
      expect(calOpenEventFormMock).to.have.been.calledWith(event.calendarHomeId, eventClone);
    });
  });

  describe('The deleteEvent method', function() {
    it('should close the popover and delete the event if it is not a recurrent event', function() {
      const event = {
        calendarHomeId: 'calendarHomeId', isInstance: () => false, path: 'event/path', etag: 'etag'
      };
      const controller = initController({ event });

      controller.deleteEvent();

      expect(calEventPreviewPopoverServiceMock.close).to.have.been.called;
      expect(calEventServiceMock.removeEvent).to.have.been.calledWith(event.path, event, event.etag, false);
    });

    it('should close the popover and open the confirmation modal if it is a recurrent event, and delete only the current event instance if the user chooses so', function() {
      const event = {
        calendarHomeId: 'calendarHomeId', isInstance: () => true, path: 'event/path', etag: 'etag'
      };
      const controller = initController({ event });

      controller.deleteEvent();

      expect(calEventPreviewPopoverServiceMock.close).to.have.been.called;
      expect($modalMock).to.have.been.calledOnce;

      const modalOptions = $modalMock.getCall(0).args[0];

      expect(modalOptions.placement).to.equal('center');

      const modalScope = {
        $hide: sinon.stub()
      };

      modalOptions.controller(modalScope);

      expect(modalScope.editChoice).to.equal('this');

      modalScope.submit();

      expect(modalScope.$hide).to.have.been.called;
      expect(calEventServiceMock.removeEvent).to.have.been.calledWith(event.path, event, event.etag, false);
    });

    it('should close the popover and open the recurrence modal if it is a recurrent event, and delete the whole event series if the user chooses so', function() {
      const event = {
        calendarHomeId: 'calendarHomeId', isInstance: () => true, path: 'event/path', etag: 'etag'
      };
      const controller = initController({ event });

      controller.deleteEvent();

      expect(calEventPreviewPopoverServiceMock.close).to.have.been.called;
      expect($modalMock).to.have.been.calledOnce;

      const modalOptions = $modalMock.getCall(0).args[0];

      expect(modalOptions.placement).to.equal('center');

      const modalScope = {
        $hide: sinon.stub()
      };

      modalOptions.controller(modalScope);

      expect(modalScope.editChoice).to.equal('this');

      modalScope.editChoice = 'all';

      modalScope.submit();

      expect(modalScope.$hide).to.have.been.called;
      expect(calEventServiceMock.removeEvent).to.have.been.calledWith(event.path, event, event.etag, true);
    });
  });

  describe('The duplicateEvent method', function() {
    it('should duplicate the event and open the event form with the duplicated event', function() {
      const event = { uid: 'event', calendarHomeId: 'calendarHomeId' };
      const duplicatedEvent = { uid: 'duplicated-event', calendarHomeId: 'calendarHomeId' };
      const controller = initController({ event });

      calEventDuplicateServiceMock.duplicateEvent = sinon.stub().returns($q.when(duplicatedEvent));

      controller.duplicateEvent();

      expect(calEventDuplicateServiceMock.duplicateEvent).to.have.been.calledWith(event);

      $rootScope.$digest();

      expect(calOpenEventFormMock).to.have.been.calledWith(sessionUser._id, duplicatedEvent);
    });
  });

  describe('The changeParticipation method', function() {
    let event, calendarOwnerAsAttendee;

    describe('When the user is the organizer of the event', function() {
      beforeEach(function() {
        event = {
          uid: 'event', calendarHomeId: 'calendarHomeId', path: 'event/path', etag: 'etag', organizer: { email: 'organizer@email.test' }
        };
        calendarOwnerAsAttendee = { email: event.organizer.email };
      });

      it('should do nothing when the event is non recurring and the new participation status is the same as the old one', function() {
        const status = 'ACCEPTED';

        event.isInstance = () => false;
        event.getOrganizerPartStat = () => status;
        event.setOrganizerPartStat = sinon.stub();

        const controller = initController({ event, calendarOwnerAsAttendee });

        controller.changeParticipation(status);

        expect(event.setOrganizerPartStat).to.have.not.been.called;
        expect(calEventPreviewPopoverServiceMock.close).to.have.not.been.called;
      });

      it('should change the participation status of the organizer when the event is non recurring', function() {
        const status = 'ACCEPTED';

        event.isInstance = () => false;
        event.getOrganizerPartStat = () => 'NEEDS-ACTION';

        calEventServiceMock.changeParticipation = sinon.stub().returns($q.when({ etag: 'new-etag' }));

        const controller = initController({ event, calendarOwnerAsAttendee });

        controller.changeParticipation(status);

        expect(calEventPreviewPopoverServiceMock.close).to.have.not.been.called;
        expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(event.path, event, [event.organizer.email], status, event.etag);

        $rootScope.$digest();

        expect(controller.event.etag).to.equal('new-etag');
        expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(status);
      });

      it('should display an error notification when it failed to change the participation status of the organizer when the event is non recurring', function() {
        const status = 'ACCEPTED';

        event.isInstance = () => false;
        event.getOrganizerPartStat = () => 'NEEDS-ACTION';

        calEventServiceMock.changeParticipation = sinon.stub().returns($q.reject(new Error('Something went wrong')));

        const controller = initController({ event, calendarOwnerAsAttendee });

        controller.changeParticipation(status);

        expect(calEventPreviewPopoverServiceMock.close).to.have.not.been.called;
        expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(event.path, event, [event.organizer.email], status, event.etag);

        $rootScope.$digest();

        expect(calPartstatUpdateNotificationServiceMock).to.have.not.been.called;
        expect(notificationFactoryMock.weakError).to.have.been.calledWith('', 'Event participation modification failed');
      });

      it('should open the recurrence modal when the event is recurring and change the participation status of the organizer for the recurrent instance only when he chooses to do so', function() {
        const status = 'ACCEPTED';

        event.isInstance = () => true;
        event.recurrenceId = 'recurrence-id';
        event.getOrganizerPartStat = () => 'NEEDS-ACTION';

        calEventServiceMock.changeParticipation = sinon.stub().returns($q.when({ etag: 'new-etag' }));

        const controller = initController({ event, calendarOwnerAsAttendee });

        controller.changeParticipation(status);

        expect(calEventPreviewPopoverServiceMock.close).to.have.been.called;
        expect($modalMock).to.have.been.calledOnce;

        const modalOptions = $modalMock.getCall(0).args[0];

        expect(modalOptions.placement).to.equal('center');

        const modalScope = {
          $hide: sinon.stub()
        };

        modalOptions.controller(modalScope);

        expect(modalScope.editChoice).to.equal('this');

        modalScope.submit();

        expect(modalScope.$hide).to.have.been.called;

        expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(event.path, event, [event.organizer.email], status, event.etag);

        $rootScope.$digest();

        expect(controller.event.etag).to.equal('new-etag');
        expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(status);
      });

      it('should open the recurrence modal when the event is recurring and change the participation status of the organizer for the whole series when he chooses to do so', function() {
        const status = 'ACCEPTED';

        event.isInstance = () => true;
        event.recurrenceId = 'recurrence-id';
        event.getOrganizerPartStat = () => 'NEEDS-ACTION';

        const masterEvent = { ...event };

        delete event.reurrenceId;

        event.getModifiedMaster = sinon.stub().returns($q.when(masterEvent));

        calEventServiceMock.changeParticipation = sinon.stub().returns($q.when({ etag: 'new-etag' }));

        const controller = initController({ event, calendarOwnerAsAttendee });

        controller.changeParticipation(status);

        expect(calEventPreviewPopoverServiceMock.close).to.have.been.called;
        expect($modalMock).to.have.been.calledOnce;

        const modalOptions = $modalMock.getCall(0).args[0];

        expect(modalOptions.placement).to.equal('center');

        const modalScope = {
          $hide: sinon.stub()
        };

        modalOptions.controller(modalScope);

        expect(modalScope.editChoice).to.equal('this');

        modalScope.editChoice = 'all';
        modalScope.submit();

        expect(modalScope.$hide).to.have.been.called;

        $rootScope.$digest();

        expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(masterEvent.path, masterEvent, [masterEvent.organizer.email], status, masterEvent.etag);

        $rootScope.$digest();

        expect(controller.event.etag).to.equal('new-etag');
        expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(status);
      });
    });

    describe('When the user is the attendee of the event', function() {
      beforeEach(function() {
        event = {
          uid: 'event', calendarHomeId: 'calendarHomeId', path: 'event/path', etag: 'etag', organizer: { email: 'organizer@email.test' }
        };
        calendarOwnerAsAttendee = { email: 'attendee@email.test' };
      });

      it('should change the participation status when the event is non recurring', function() {
        const status = 'ACCEPTED';

        event.isInstance = () => false;

        calEventServiceMock.changeParticipation = sinon.stub().returns($q.when());

        const controller = initController({ event, calendarOwnerAsAttendee });

        controller.changeParticipation(status);

        expect(calEventPreviewPopoverServiceMock.close).to.have.not.been.called;
        expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(event.path, event, [calendarOwnerAsAttendee.email], status);

        $rootScope.$digest();

        expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(status);
      });

      it('should display an error notification when it failed to change the participation status when the event is non recurring', function() {
        const status = 'ACCEPTED';

        event.isInstance = () => false;

        calEventServiceMock.changeParticipation = sinon.stub().returns($q.reject(new Error('Something went wrong')));

        const controller = initController({ event, calendarOwnerAsAttendee });

        controller.changeParticipation(status);

        expect(calEventPreviewPopoverServiceMock.close).to.have.not.been.called;
        expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(event.path, event, [calendarOwnerAsAttendee.email], status);

        $rootScope.$digest();

        expect(calPartstatUpdateNotificationServiceMock).to.have.not.been.called;
        expect(notificationFactoryMock.weakError).to.have.been.calledWith('', 'Event participation modification failed');
      });

      it('should open the recurrence modal when the event is recurring and change the participation status for the recurrent instance only when the user chooses to do so', function() {
        const status = 'ACCEPTED';

        event.isInstance = () => true;
        event.recurrenceId = 'recurrence-id';

        calEventServiceMock.changeParticipation = sinon.stub().returns($q.when());

        const controller = initController({ event, calendarOwnerAsAttendee });

        controller.changeParticipation(status);

        expect(calEventPreviewPopoverServiceMock.close).to.have.been.called;
        expect($modalMock).to.have.been.calledOnce;

        const modalOptions = $modalMock.getCall(0).args[0];

        expect(modalOptions.placement).to.equal('center');

        const modalScope = {
          $hide: sinon.stub()
        };

        modalOptions.controller(modalScope);

        expect(modalScope.editChoice).to.equal('this');

        modalScope.submit();

        expect(modalScope.$hide).to.have.been.called;

        expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(event.path, event, [calendarOwnerAsAttendee.email], status);

        $rootScope.$digest();

        expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(status);
      });

      it('should open the recurrence modal when the event is recurring and change the participation status for the whole series when the user chooses to do so', function() {
        const status = 'ACCEPTED';

        event.isInstance = () => true;
        event.recurrenceId = 'recurrence-id';

        const masterEvent = { ...event };

        delete event.reurrenceId;

        event.getModifiedMaster = sinon.stub().returns($q.when(masterEvent));

        calEventServiceMock.changeParticipation = sinon.stub().returns($q.when());

        const controller = initController({ event, calendarOwnerAsAttendee });

        controller.changeParticipation(status);

        expect(calEventPreviewPopoverServiceMock.close).to.have.been.called;
        expect($modalMock).to.have.been.calledOnce;

        const modalOptions = $modalMock.getCall(0).args[0];

        expect(modalOptions.placement).to.equal('center');

        const modalScope = {
          $hide: sinon.stub()
        };

        modalOptions.controller(modalScope);

        expect(modalScope.editChoice).to.equal('this');

        modalScope.editChoice = 'all';
        modalScope.submit();

        expect(modalScope.$hide).to.have.been.called;

        $rootScope.$digest();

        expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(masterEvent.path, masterEvent, [calendarOwnerAsAttendee.email], status);

        $rootScope.$digest();

        expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(status);
      });
    });
  });
});
