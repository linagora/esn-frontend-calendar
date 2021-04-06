angular.module('esn.calendar.libs')
  .service('calEventPreviewPopoverService', calEventPreviewPopoverService);

function calEventPreviewPopoverService($rootScope, $compile) {
  let eventPreviewPopoverElement;
  let isEventPreviewPopoverOpen = false;
  let cleanUpFunctions = [];
  let scope;

  return {
    open,
    close
  };

  function open({ targetElement, event, calendarHomeId }) {
    if (!scope) scope = $rootScope.$new();

    scope.$ctrl = { event, calendarHomeId };

    scope.$digest();

    if (!eventPreviewPopoverElement) {
      _createEventPreviewPopoverElement();
    }

    if (isEventPreviewPopoverOpen) {
      _cleanUp();
    } else {
      eventPreviewPopoverElement.show();
    }

    cleanUpFunctions.push(_addListenersToClosePopover(targetElement));

    _repositionPopover(targetElement);

    isEventPreviewPopoverOpen = true;
  }

  function close() {
    if (!isEventPreviewPopoverOpen || !eventPreviewPopoverElement) return;

    isEventPreviewPopoverOpen = false;

    eventPreviewPopoverElement.hide();

    _cleanUp();
  }

  function _repositionPopover(targetElement) {
    eventPreviewPopoverElement.position({
      of: $(targetElement),
      at: 'left',
      my: 'right',
      collision: 'flipfit'
    });
  }

  function _cleanUp() {
    cleanUpFunctions.forEach(cleanUpFunction => cleanUpFunction());
    cleanUpFunctions = [];
  }

  function _createEventPreviewPopoverElement() {
    eventPreviewPopoverElement = $compile('<event-preview-popover event="$ctrl.event" calendar-home-id="$ctrl.calendarHomeId" />')(scope);

    $(document.body).append(eventPreviewPopoverElement);

    scope.$digest();
  }

  function _addListenersToClosePopover(targetElement) {
    document.addEventListener('click', handleClickAway);
    document.addEventListener('scroll', handleScroll, true);

    function handleClickAway(e) {
      if (eventPreviewPopoverElement[0].contains(e.target) ||
        e.target === targetElement ||
        e.target.className.includes('fc-title') ||
        e.target.className.includes('fc-resizer') ||
        e.target.parentNode.className.includes('fc-title')) {
        return;
      }

      close();
    }

    function handleScroll(e) {
      if (e.target.className.includes('event-preview-popover-body-container')) return;

      close();
    }

    return function _removeListeners() {
      document.removeEventListener('click', handleClickAway);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }
}
