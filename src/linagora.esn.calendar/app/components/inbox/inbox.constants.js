'use strict';

angular.module('esn.calendar')

  .constant('X_OPENPAAS_CAL_HEADERS', {
    ACTION: 'X-Openpaas-Cal-Action',
    EVENT_PATH: 'X-Openpaas-Cal-Event-Path'
  })

  .constant('X_OPENPAAS_CAL_VALUES', {
    RESOURCE_REQUEST: 'RESOURCE_REQUEST'
  })

  .constant('INVITATION_MESSAGE_HEADERS', {
    METHOD: 'X-MEETING-METHOD',
    UID: 'X-MEETING-UID',
    RECURRENCE_ID: 'X-MEETING-RECURRENCE-ID',
    SEQUENCE: 'X-MEETING-SEQUENCE',
    DTSTAMP: 'X-MEETING-DTSTAMP'
  })

  .constant('X_OPENPAAS_VIDEOCONFERENCE', 'X-OPENPAAS-VIDEOCONFERENCE');
