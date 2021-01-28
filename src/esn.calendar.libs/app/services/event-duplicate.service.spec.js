'use strict';

/* global chai: false */

const { expect } = chai;

describe('the calEventDuplicateService service', () => {
  let calEventDuplicateService;

  beforeEach(() => {
    angular.mock.module('esn.calendar.libs');

    angular.mock.inject(function(_calEventDuplicateService_) {
      calEventDuplicateService = _calEventDuplicateService_;
    });
  });

  afterEach(() => {
    calEventDuplicateService.reset();
  });

  describe('the getDuplicateEventSource function', () => {
    it('should correctly return the stored event source calendarID', () => {
      calEventDuplicateService.setDuplicateEventSource('TEST');
      const result = calEventDuplicateService.getDuplicateEventSource();

      expect(result).to.eq('TEST');
    });

    it('should return null if no calendarID is stored', () => {
      const result = calEventDuplicateService.getDuplicateEventSource();

      expect(result).to.eq(null);
    });
  });

  describe('the setDuplicateEventSource function', () => {
    it('should correctly set the source calendarID correctly', () => {
      expect(calEventDuplicateService.getDuplicateEventSource()).to.eq(null);

      calEventDuplicateService.setDuplicateEventSource('123');

      expect(calEventDuplicateService.getDuplicateEventSource()).to.eq('123');
    });
  });

  describe('the reset function', () => {
    it('should correctly revert the calendarID back to the initial state', () => {
      calEventDuplicateService.setDuplicateEventSource('123');
      calEventDuplicateService.reset();

      expect(calEventDuplicateService.getDuplicateEventSource()).to.eq(null);
    });
  });
});
