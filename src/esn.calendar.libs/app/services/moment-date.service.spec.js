'use strict';

/* global chai: false */
/* global moment: false */

const { expect } = chai;

describe('the calMomentDate service', () => {
  let testMomentDate, testDate, calMomentDateService;

  beforeEach(() => {
    testDate = new Date('2020-11-03 09:27');
    testMomentDate = moment('2020-10-04 10:35');

    angular.mock.module('esn.calendar.libs');

    angular.mock.inject(function(_calMomentDateService_) {
      calMomentDateService = _calMomentDateService_;
    });
  });

  describe('the momentToDate function', () => {
    it('should ignore invalid moment objects', () => {
      [undefined, 'something wrong', new Date()].forEach(test => {
        expect(calMomentDateService.momentToDate(test)).to.be.undefined;
      });
    });

    it('should correctly convert a moment object to a date', () => {
      const result = calMomentDateService.momentToDate(testMomentDate);

      expect(result instanceof Date).to.be.true;

      expect(result.getMinutes()).to.eq(35);
      expect(result.getHours()).to.eq(10);
      expect(result.getDate()).to.eq(4);
      expect(result.getMonth()).to.eq(9);
      expect(result.getFullYear()).to.eq(2020);
    });
  });

  describe('the getDateComponents function', () => {
    it('should ignore non Date objects', () => {
      [undefined, 'wrong', moment()].forEach(test => {
        expect(calMomentDateService.getDateComponents(test)).to.be.undefined;
      });
    });

    it('should correctly return the components of a date object', () => {
      const result = calMomentDateService.getDateComponents(testDate);

      expect(result.minute).to.eq(27);
      expect(result.hour).to.eq(9);
      expect(result.date).to.eq(3);
      expect(result.month).to.eq(10);
      expect(result.year).to.eq(2020);
    });
  });
});
