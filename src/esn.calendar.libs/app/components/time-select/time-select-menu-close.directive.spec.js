'use strict';

/* global chai: false */
/* global sinon: false */

const { expect } = chai;

describe('the timeSelectMenuClose directive', function() {
  beforeEach(function() {
    angular.mock.module('esn.calendar.libs');
    angular.mock.inject(function($compile, $rootScope, $window) {
      this.$compile = $compile;
      this.$rootScope = $rootScope;
      this.$scope = this.$rootScope.$new();
      this.$window = $window;
    });

    this.initDirective = function(scope) {
      const html = angular.element('<div time-select-menu-close="onClose()"/>');
      const element = this.$compile(html)(scope);

      scope.$digest();

      return element;
    };
  });

  it('should add a click event listener when the menu is open', function() {
    const documentSpy = sinon.stub(document, 'addEventListener');

    this.initDirective(this.$scope);

    this.$scope.$emit('$mdMenuOpen');

    expect(documentSpy).to.be.calledWith('click');
  });

  it('should remove the click event listener when the menu is open', function() {
    const documentSpy = sinon.stub(document, 'removeEventListener');

    this.initDirective(this.$scope);

    this.$scope.$emit('$mdMenuClose');

    expect(documentSpy).to.be.calledWith('click');
  });

  it('should close the menu when the event is dragged', function() {
    this.$scope.$apply = sinon.spy();
    const draggableHtml = '<div class="event-form"><div class="ui-draggable"></div></div>';

    angular.element(document.body).append(draggableHtml);
    this.initDirective(this.$scope);

    const draggableElement = $('.event-form .ui-draggable');

    draggableElement.triggerHandler('dragstart');

    expect(this.$scope.$apply).to.be.called;
  });
});
