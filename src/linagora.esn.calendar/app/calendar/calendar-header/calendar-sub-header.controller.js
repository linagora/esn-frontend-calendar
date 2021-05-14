import CalNotification from 'calendar-next-gen/src/modules/notification/presentation/components/CalNotification/CalNotification.vue';
import { createApp } from 'vue';
import davClient from 'calendar-next-gen/src/modules/core/infrastructure/http/core.http.dav.client.ts';

angular.module('esn.calendar')
  .controller('calendarSubHeaderController', calendarSubHeaderController);

function calendarSubHeaderController($scope, $q, session, tokenAPI, calCalDAVURLService, calendarCurrentView, calMoment) {
  $scope.isCurrentViewAroundToday = isCurrentViewAroundToday;

  //////////////////////

  function isCurrentViewAroundToday() {
    return calendarCurrentView.isCurrentViewAroundDay(calMoment());
  }

  // ======================== MOUNT THE NOTIFICATION COMPONENT ========================
  let davServerURLPromise;

  $q.all([tokenAPI.getWebToken(), _getDAVServerUrl()])
    .then(([{ data: jwt }, serverBaseUrl]) => {
      davClient.changeBaseURL(serverBaseUrl);
      davClient.attachHeaders({ Authorization: `Bearer ${jwt}` });

      createApp(CalNotification, { user: { id: session.user._id, preferredEmail: session.user.preferredEmail } })
        .mount('#cal-event-notifications');
    });

  function _getDAVServerUrl() {
    davServerURLPromise = davServerURLPromise || calCalDAVURLService.getFrontendURL();

    return davServerURLPromise;
  }
}
