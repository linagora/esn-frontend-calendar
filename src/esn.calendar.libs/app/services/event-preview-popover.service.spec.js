'use strict';

/* global chai, sinon */

const { expect } = chai;

describe('The calEventPreviewPopoverService', function() {
  let $rootScope, calEventPreviewPopoverService;
  let $compileMock, $compileReturnStub, jQueryAppendStub;
  let scope, eventPreviewPopoverElement, targetElement, event, calendarHomeId;

  beforeEach(function() {
    eventPreviewPopoverElement = {
      position: sinon.stub(),
      show: sinon.stub(),
      hide: sinon.stub()
    };

    $compileReturnStub = sinon.stub().returns(eventPreviewPopoverElement);
    $compileMock = sinon.stub().returns($compileReturnStub);

    angular.mock.module('esn.calendar.libs');
    angular.mock.module(function($provide) {
      $provide.value('$compile', $compileMock);
    });

    angular.mock.inject(function(_$rootScope_, _calEventPreviewPopoverService_) {
      $rootScope = _$rootScope_;
      calEventPreviewPopoverService = _calEventPreviewPopoverService_;
    });
  });

  beforeEach(function() {
    scope = {
      $digest: sinon.stub()
    };

    $rootScope.$new = sinon.stub().returns(scope);

    targetElement = { id: 'some-dom-element' };
    event = { uid: 'some-event-uid' };
    calendarHomeId = 'calendarHomeId';
  });

  beforeEach(function() {
    jQueryAppendStub = sinon.stub($.fn, 'append');
  });

  afterEach(function() {
    jQueryAppendStub.restore();
  });

  describe('The open function', function() {
    it('should create a new popover element if it has not been created yet', function() {
      calEventPreviewPopoverService.open({ targetElement, event, calendarHomeId });

      expect($rootScope.$new).to.have.been.calledOnce;
      expect(scope.$digest).to.have.been.calledTwice;
      expect(scope.$ctrl).to.deep.equal({ event, calendarHomeId });
      expect($compileMock).to.have.been.calledWith('<event-preview-popover event="$ctrl.event" calendar-home-id="$ctrl.calendarHomeId" />');
      expect($compileReturnStub).to.have.been.calledWith(scope);
      expect(jQueryAppendStub).to.have.been.calledWith(eventPreviewPopoverElement);
      expect(eventPreviewPopoverElement.show).to.have.been.calledOnce;
      expect(eventPreviewPopoverElement.position).to.have.been.calledWith({
        of: $(targetElement),
        at: 'left',
        my: 'right',
        collision: 'flipfit'
      });
    });

    it('should just show the existing popover element when it has been created', function() {
      calEventPreviewPopoverService.open({ targetElement, event, calendarHomeId });
      calEventPreviewPopoverService.open({ targetElement, event, calendarHomeId });

      expect($rootScope.$new).to.have.been.calledOnce;
      expect(scope.$digest.callCount).to.equal(3);
      expect(scope.$ctrl).to.deep.equal({ event, calendarHomeId });
      expect($compileMock).to.have.been.calledOnce;
      expect($compileMock).to.have.been.calledWith('<event-preview-popover event="$ctrl.event" calendar-home-id="$ctrl.calendarHomeId" />');
      expect($compileReturnStub).to.have.been.calledOnce;
      expect($compileReturnStub).to.have.been.calledWith(scope);
      expect(jQueryAppendStub).to.have.been.calledOnce;
      expect(jQueryAppendStub).to.have.been.calledWith(eventPreviewPopoverElement);
      expect(eventPreviewPopoverElement.show).to.have.been.calledOnce;
      expect(eventPreviewPopoverElement.position).to.have.been.calledWith({
        of: $(targetElement),
        at: 'left',
        my: 'right',
        collision: 'flipfit'
      });
    });
  });

  describe('The close function', function() {
    it('should hide the popover element', function() {
      calEventPreviewPopoverService.open({ targetElement, event });

      calEventPreviewPopoverService.close();

      expect(eventPreviewPopoverElement.hide).to.have.been.calledOnce;
    });

    it('should do nothing when the popover element is already hidden', function() {
      calEventPreviewPopoverService.open({ targetElement, event });

      calEventPreviewPopoverService.close();
      calEventPreviewPopoverService.close();

      expect(eventPreviewPopoverElement.hide).to.have.been.calledOnce;
    });
  });
});
