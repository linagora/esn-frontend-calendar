angular.module('esn.calendar.libs')
  .service('calendarSidebarService', calendarSidebarService);

function calendarSidebarService($rootScope, CAL_SIDEBAR_VISIBILITY) {
  let isSidebarVisible = true;

  function getSidebarVisibility() {
    return isSidebarVisible;
  }

  function setSidebarVisibility(sidebarVisibility) {
    isSidebarVisible = sidebarVisibility;

    $rootScope.$broadcast(CAL_SIDEBAR_VISIBILITY);
  }

  return {
    getSidebarVisibility,
    setSidebarVisibility
  };
}
