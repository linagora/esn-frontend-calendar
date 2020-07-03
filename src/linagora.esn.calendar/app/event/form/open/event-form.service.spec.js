'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The calEventFormService', function() {
  var $modal, $q, $rootScope, $state, calEventFormService, calendarService, calUIAuthorizationService, notificationFactory, CAL_EVENTS;
  var calendar, calendarHomeId, recurrenceInstance, regularEvent, session;

  beforeEach(function() {
    calendarHomeId = '123';
    calendar = {id: 1, calendarHomeId: calendarHomeId};
    $modal = sinon.spy();
    $state = {
      go: sinon.spy()
    };
    calendarService = {
      calendarHomeId: calendarHomeId,
      getCalendar: sinon.spy(function() {
        return $q.when(calendar);
      })
    };
    regularEvent = {
      etag: 'etag',
      uid: '456',
      calendarHomeId: 'eventCalendarHomeId',
      calendarId: 'eventCalendarId',
      isInstance: sinon.stub().returns(false)
    };
    recurrenceInstance = {
      id: '456',
      calendarHomeId: 'eventCalendarHomeId',
      calendarId: 'eventCalendarId',
      isInstance: sinon.stub().returns(true),
      getModifiedMaster: sinon.spy(function() {
        return $q.when(recurrenceInstance);
      }),
      isPublic: sinon.stub().returns(true)
    };

    module('linagora.esn.graceperiod', 'esn.calendar');
    module(function($provide) {
      $provide.value('$modal', $modal);
      $provide.value('$state', $state);
      $provide.value('calendarService', calendarService);
    });
  });

  beforeEach(inject(function(_$q_, _$rootScope_, _calEventFormService_, _calUIAuthorizationService_, _notificationFactory_, _session_, _CAL_EVENTS_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    calEventFormService = _calEventFormService_;
    calUIAuthorizationService = _calUIAuthorizationService_;
    notificationFactory = _notificationFactory_;
    session = _session_;
    CAL_EVENTS = _CAL_EVENTS_;
  }));

  describe('The openEventForm function', function() {
    var canAccessEventDetail, canModifyEvent;

    beforeEach(function() {
      canAccessEventDetail = true;
      canModifyEvent = true;
      session.user._id = '_id';

      sinon.stub(calUIAuthorizationService, 'canAccessEventDetails', function() {
        return canAccessEventDetail;
      });
      sinon.stub(calUIAuthorizationService, 'canModifyEvent', function() {
        return canModifyEvent;
      });

    });

    describe('When it is a regular event', function() {
      it('should call calendarService with the provided calendarHomeId and calendarId', function(done) {
        calendarService.getCalendar = sinon.spy(function(_calendarHomeId, _calendarId) {
          expect(_calendarHomeId).to.equal(regularEvent.calendarHomeId);
          expect(_calendarId).to.equal(regularEvent.calendarId);
          done();
        });

        calEventFormService.openEventForm(regularEvent.calendarHomeId, regularEvent.calendarId, regularEvent);

        $rootScope.$digest();
      });

      it('should call $modal', function() {
        calEventFormService.openEventForm(regularEvent.calendarHomeId, regularEvent.calendarId, regularEvent);

        $rootScope.$digest();

        expect($modal).to.have.been.called;
        expect($state.go).to.not.have.been;
        expect($modal).to.have.been.calledWith(sinon.match({
          templateUrl: '/calendar/app/event/form/modals/event-form-modal.html',
          backdrop: 'static',
          placement: 'center'
        }));
      });

      it('should call $modal only once even if clicking several times', function() {
        calEventFormService.openEventForm(regularEvent.calendarHomeId, regularEvent.calendarId, regularEvent);
        calEventFormService.openEventForm(regularEvent.calendarHomeId, regularEvent.calendarId, regularEvent);

        $rootScope.$digest();

        expect($modal).to.have.been.calledOnce;
      });

      it('should recall $modal if closed before', function() {
        calEventFormService.openEventForm(regularEvent.calendarHomeId, regularEvent.calendarId, regularEvent);

        $rootScope.$digest();

        expect($modal).to.have.been.calledWith(sinon.match({
          controller: sinon.match.func.and(sinon.match(function(controller) {
            var openForm = sinon.spy();
            var $hide = sinon.spy();
            var $scope = {
              $hide: $hide
            };

            controller($scope, recurrenceInstance, openForm);
            $scope.$hide();
            expect($hide).to.have.been.called;

            return true;
          }))
        }));

        calEventFormService.openEventForm(regularEvent.calendarHomeId, regularEvent.calendarId, regularEvent);

        $rootScope.$digest();

        expect($modal).to.have.been.calledTwice;
      });

      it('should hide modal when CAL_EVENTS.MODAL.hide is broadcasted', function(done) {
        var calendarUnselectListenerSpy = sinon.spy();

        $rootScope.$on(CAL_EVENTS.CALENDAR_UNSELECT, calendarUnselectListenerSpy);

        calEventFormService.openEventForm(regularEvent.calendarHomeId, regularEvent.calendarId, regularEvent);

        $rootScope.$digest();

        expect($modal).to.have.been.calledWith(sinon.match({
          controller: sinon.match.func.and(sinon.match(function(controller) {
            var openForm = sinon.spy();

            var $scope = {
              cancel: sinon.spy()
            };

            controller($scope, recurrenceInstance, openForm);

            $rootScope.$broadcast(CAL_EVENTS.MODAL + '.hide');

            expect($scope.cancel).to.have.been.called;
            expect($scope.calendarHomeId).to.equal(session.user._id);
            expect(calendarUnselectListenerSpy).to.have.been.called;

            done();

            return true;
          }))
        }));
      });

      it('should unregister the listener of CAL_EVENTS.MODAL.hide after hiding the modal', function(done) {
        var calendarUnselectListenerSpy = sinon.spy();

        $rootScope.$on(CAL_EVENTS.CALENDAR_UNSELECT, calendarUnselectListenerSpy);

        calEventFormService.openEventForm(regularEvent.calendarHomeId, regularEvent.calendarId, regularEvent);

        $rootScope.$digest();

        expect($modal).to.have.been.calledWith(sinon.match({
          controller: sinon.match.func.and(sinon.match(function(controller) {
            var openForm = sinon.spy();

            var $scope = {
              cancel: sinon.spy()
            };

            controller($scope, recurrenceInstance, openForm);

            $rootScope.$broadcast(CAL_EVENTS.MODAL + '.hide');
            $rootScope.$broadcast(CAL_EVENTS.MODAL + '.hide');

            expect($scope.cancel).to.have.been.calledTwice;
            expect($scope.calendarHomeId).to.equal(session.user._id);
            expect(calendarUnselectListenerSpy).to.have.been.calledTwice;

            done();

            return true;
          }))
        }));
      });
    });

    describe('When it is a recurrent event', function() {
      describe('When user cannot edit event', function() {
        it('should open event form with instance when user', function() {
          canModifyEvent = false;

          calEventFormService.openEventForm(recurrenceInstance.calendarHomeId, recurrenceInstance.calendarId, recurrenceInstance);

          $rootScope.$digest();

          expect($modal).to.have.been.called;
          expect($state.go).to.not.have.been;
          expect($modal).to.have.been.calledWith(sinon.match({
            templateUrl: '/calendar/app/event/form/modals/event-form-modal.html',
            backdrop: 'static',
            placement: 'center'
          }));
        });
      });

      describe('When user can edit event', function() {
        it('should open choice modal with instance selected by default', function() {
          calEventFormService.openEventForm(recurrenceInstance.calendarHomeId, recurrenceInstance.calendarId, recurrenceInstance);

          $rootScope.$digest();

          expect($modal).to.have.been.calledWith(sinon.match({
            templateUrl: '/calendar/app/event/form/modals/edit-instance-or-series-modal.html',
            resolve: {
              event: sinon.match.func.and(sinon.match(function(eventGetter) {
                return eventGetter() === recurrenceInstance;
              }))
            },
            controller: sinon.match.func.and(sinon.match(function(controller) {
              var openForm = sinon.spy();
              var $scope = {
                $hide: sinon.spy()
              };

              controller($scope, calendar, recurrenceInstance, openForm);
              recurrenceInstance.recurrenceIdAsString = '20170425T083000Z';

              $scope.submit();
              $rootScope.$digest();

              expect(openForm).to.have.been.calledWith(calendar, recurrenceInstance);
              expect($scope.$hide).to.have.been.calledOnce;

              return true;
            })),
            placement: 'center'
          }));
        });

        describe('When it is a full event', function() {
          it('should get master event first and then open it when user chooses to edit all instances', function() {
            calEventFormService.openEventForm(recurrenceInstance.calendarHomeId, recurrenceInstance.calendarId, recurrenceInstance);

            $rootScope.$digest();

            expect($modal).to.have.been.calledWith(sinon.match({
              templateUrl: '/calendar/app/event/form/modals/edit-instance-or-series-modal.html',
              resolve: {
                event: sinon.match.func.and(sinon.match(function(eventGetter) {
                  return eventGetter() === recurrenceInstance;
                }))
              },
              controller: sinon.match.func.and(sinon.match(function(controller) {
                var openForm = sinon.spy();
                var $scope = {
                  $hide: sinon.spy()
                };

                controller($scope, calendar, recurrenceInstance, openForm);
                recurrenceInstance.recurrenceIdAsString = '20170425T083000Z';
                $scope.editChoice = 'all';

                $scope.submit();
                $rootScope.$digest();

                expect(recurrenceInstance.getModifiedMaster).to.have.been.calledWith(true);
                expect(openForm).to.have.been.calledWith(calendar, recurrenceInstance);
                expect($scope.$hide).to.have.been.calledOnce;

                return true;
              })),
              placement: 'center'
            }));
          });
        });

        describe('When  it is an event from search', function() {
          it('should open the event without it recurrenceId when user chooses to edit all instances', function() {
            recurrenceInstance.fetchFullEvent = angular.noop;
            recurrenceInstance.recurrenceId = 'recurrenceId1';
            calEventFormService.openEventForm(recurrenceInstance.calendarHomeId, recurrenceInstance.calendarId, recurrenceInstance);

            $rootScope.$digest();

            expect($modal).to.have.been.calledWith(sinon.match({
              templateUrl: '/calendar/app/event/form/modals/edit-instance-or-series-modal.html',
              resolve: {
                event: sinon.match.func.and(sinon.match(function(eventGetter) {
                  return eventGetter() === recurrenceInstance;
                }))
              },
              controller: sinon.match.func.and(sinon.match(function(controller) {
                var openForm = sinon.spy();
                var $scope = {
                  $hide: sinon.spy()
                };

                controller($scope, calendar, recurrenceInstance, openForm);
                recurrenceInstance.recurrenceIdAsString = '20170425T083000Z';
                $scope.editChoice = 'all';

                $scope.submit();
                $rootScope.$digest();

                expect(recurrenceInstance.recurrenceId).to.not.exist;
                expect(recurrenceInstance.getModifiedMaster).to.have.not.been.called;
                expect(openForm).to.have.been.calledWith(calendar, recurrenceInstance);
                expect($scope.$hide).to.have.been.calledOnce;

                return true;
              })),
              placement: 'center'
            }));
          });
        });
      });
    });

    it('should prevent click action and display notification if event is private and current user is not the owner', function() {
      sinon.spy(notificationFactory, 'weakInfo');
      canAccessEventDetail = false;

      var openEventForm = calEventFormService.openEventForm(regularEvent.calendarHomeId, regularEvent.calendarId, regularEvent);

      $rootScope.$digest();

      expect(regularEvent.isInstance).to.have.not.been.called;
      expect(notificationFactory.weakInfo).to.have.been.calledWith('Private event', 'Cannot access private event');
      expect(openEventForm).to.be.undefined;
    });
  });
});
