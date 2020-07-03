(function() {
  'use strict';

  angular.module('esn.calendar')

    .constant('CAL_UI_CONFIG', {
      calendar: {
        defaultView: 'agendaWeek',
        scrollTime: '08:00:00',
        theme: true,
        height: 450,
        editable: true,
        selectable: true,
        timezone: 'local',
        nowIndicator: true,
        defaultTimedEventDuration: '00:30:00',
        forceEventDuration: true,
        weekNumbers: true,
        firstDay: 1,
        header: {
          left: 'agendaDay, agendaWeek, month',
          center: 'title',
          right: 'prev, today, next'
        },
        themeButtonIcons: {
          today: ' mdi mdi-calendar-today',
          month: ' mdi mdi-view-module',
          agendaWeek: ' mdi mdi-view-week',
          agendaDay: ' mdi mdi-view-day',
          prev: ' mdi mdi-chevron-left',
          next: ' mdi mdi-chevron-right'
        },
        handleWindowResize: false,
        views: {
          agendaThreeDays: {
            type: 'agendaWeek',
            duration: { days: 3 },
            buttonText: '3 days',
            eventLimit: 3,
            eventLimitClick: 'dayWithDisplayedEvent'
          },
          month: {
            eventLimit: true,
            eventLimitClick: 'dayWithDisplayedEvent',
            eventLimitText: '...'
          },
          week: {
            eventLimit: 3,
            eventLimitClick: 'dayWithDisplayedEvent',
            eventLimitText: '...',
            columnFormat: 'dd D'
          },
          day: {
            eventLimit: true,
            eventLimitClick: 'dayWithDisplayedEvent'
          },
          dayWithDisplayedEvent: {
            type: 'agendaDay',
            eventLimit: false
          }
        }
      },
      // (Sunday=0) and ranges from 0-6. See: https://fullcalendar.io/docs/display/hiddenDays/
      calendarDaysValue: [0, 1, 2, 3, 4, 5, 6],
      calendarDefaultDaysValue: [1, 2, 3, 4, 5],
      miniCalendar: {
        defaultView: 'month',
        height: 250,
        editable: false,
        timezone: 'local',
        weekNumbers: false,
        header: {
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        columnFormat: 'dd'
      },
      planning: {
        theme: true,
        editable: false,
        timezone: 'local',
        header: {
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        themeButtonIcons: {
          prev: ' mdi mdi-chevron-left',
          next: ' mdi mdi-chevron-right'
        }
      }
    })

    .constant('CAL_ACCEPT_HEADER', 'application/calendar+json')

    .constant('CAL_DAV_DATE_FORMAT', 'YYYYMMDD[T]HHmmss')

    .constant('CAL_RELATED_EVENT_TYPES', {
      COUNTER: 'counter'
    })

    .constant('CAL_PARTSTAT_READABLE_CONFIRMATION_MESSAGE', {
      ACCEPTED: 'You will attend this meeting',
      DECLINED: 'You will not attend this meeting',
      TENTATIVE: 'You may attend this meeting'
    })

    .constant('CAL_ICAL', {
      partstat: {
        needsaction: 'NEEDS-ACTION',
        accepted: 'ACCEPTED',
        declined: 'DECLINED',
        tentative: 'TENTATIVE'
      },
      rsvp: {
        true: 'TRUE',
        false: 'FALSE'
      },
      role: {
        reqparticipant: 'REQ-PARTICIPANT',
        chair: 'CHAIR'
      },
      cutype: {
        individual: 'INDIVIDUAL',
        room: 'ROOM',
        resource: 'RESOURCE',
        group: 'GROUP',
        ldap: 'LDAP'
      },
      status: {
        CANCELLED: 'CANCELLED'
      }
    })

    .constant('CAL_RESOURCE', {
      AVATAR_URL: '/linagora.esn.resource/images/resource.png',
      type: 'calendar',
      DELETED_ICON: 'mdi-delete-forever',
      PARTSTAT_ICONS: {
        ACCEPTED: 'mdi-check-circle participation-status-accepted',
        TENTATIVE: 'mdi-pause-circle participation-status-tentative',
        'NEEDS-ACTION': 'mdi-pause-circle participation-status-needaction',
        DECLINED: 'mdi-close-circle participation-status-declined'
      }
    })

    .constant('CAL_ATTENDEE_OBJECT_TYPE', {
      contact: 'contact',
      user: 'user',
      resource: 'resource',
      group: 'group',
      ldap: 'ldap'
    })

    .constant('CAL_ATTENDEE_LIST_LIMIT', 5)

    .constant('CAL_AVAILABLE_VIEWS', ['agendaWeek', 'agendaDay', 'month', 'agendaThreeDays', 'basicDay'])

    .constant('CAL_CALENDAR_SHARED_RIGHT', {
      NONE: '0',
      NONE_LABEL: 'None',

      SHAREE_OWNER: '1',
      SHAREE_OWNER_LABEL: 'Owner',
      SHAREE_OWNER_LABEL_LONG: 'Owner',

      SHAREE_READ: '2',
      SHAREE_READ_LABEL: 'Read',
      SHAREE_READ_LABEL_LONG: 'See all event details',

      SHAREE_READ_WRITE: '3',
      SHAREE_READ_WRITE_LABEL: 'Read/Write',
      SHAREE_READ_WRITE_LABEL_LONG: 'Edit events',

      SHAREE_ADMIN: '5',
      SHAREE_ADMIN_LABEL: 'Administration',
      SHAREE_ADMIN_LABEL_LONG: 'Edit events and manage sharing',

      SHAREE_FREE_BUSY: '6',
      SHAREE_FREE_BUSY_LABEL: 'Free/Busy',
      SHAREE_FREE_BUSY_LABEL_LONG: 'Free/Busy',

      unknown: 'unknown'
    })

    .constant('CAL_CALENDAR_SHARED_RIGHT_PRIORITY', {
      SHAREE_OWNER: 9,
      SHAREE_READ: 5,
      SHAREE_READ_WRITE: 7,
      SHAREE_ADMIN: 8,
      SHAREE_FREE_BUSY: 3
    })

    .constant('CAL_CALENDAR_PUBLIC_RIGHT', {
      PRIVATE: '',
      PRIVATE_LABEL: 'Private',
      PRIVATE_LABEL_LONG: 'Hide calendar',

      READ: '{DAV:}read',
      READ_LABEL: 'Read',
      READ_LABEL_LONG: 'See all event details',

      READ_WRITE: '{DAV:}write',
      READ_WRITE_LABEL: 'Read/Write',
      READ_WRITE_LABEL_LONG: 'Edit events',

      FREE_BUSY: '{urn:ietf:params:xml:ns:caldav}read-free-busy',
      FREE_BUSY_LABEL: 'Free/Busy',
      FREE_BUSY_LABEL_LONG: 'Free/Busy',

      unknown: 'unknown'
    })

    .constant('CAL_CALENDAR_PUBLIC_RIGHT_PRIORITY', {
      PRIVATE: 0,
      READ: 4,
      READ_WRITE: 6,
      FREE_BUSY: 2
    })

    .constant('CAL_CALENDAR_SHARED_INVITE_STATUS', {
      INVITE_NORESPONSE: 'noresponse',
      INVITE_ACCEPTED: 'accepted',
      INVITE_DECLINED: 'declined',
      INVITE_INVALID: 'invalid'
    })

    .constant('CAL_CALENDAR_SHARED_TYPE', {
      DELEGATION: 'delegation',
      PUBLIC: 'public'
    })

    .constant('CAL_EVENT_CLASS', {
      PUBLIC: 'PUBLIC',
      PRIVATE: 'PRIVATE'
    })

    .constant('CAL_EVENT_METHOD', {
      COUNTER: 'COUNTER',
      REQUEST: 'REQUEST',
      REPLY: 'REPLY',
      CANCEL: 'CANCEL'
    })

    .constant('CAL_CALENDAR_PROPERTIES', {
      color: 'apple:color',
      description: 'caldav:description',
      name: 'dav:name',
      source: 'calendarserver:source',
      delegatedsource: 'calendarserver:delegatedsource'
    })

    .constant('CAL_MAX_RRULE_COUNT', 3499)

    .constant('CAL_MAX_CALENDAR_RESIZE_HEIGHT', 1107)

    .constant('CAL_DEFAULT_EVENT_COLOR', '#2196f3')

    .constant('CAL_DEFAULT_NAME', '#default')

    .constant('CAL_OLD_DEFAULT_ID', 'Events')

    .constant('CAL_TRANSLATED_DEFAULT_NAME', 'My agenda')

    .constant('CAL_CALENDAR_TYPE', {
      USER: 'user',
      RESOURCE: 'resource'
    })

    .constant('CAL_LEFT_PANEL_BOTTOM_MARGIN', 15)

    .constant('CAL_EVENT_FORM', {
      title: {
        default: 'No title',
        empty: '',
        maxlength: 1024
      },
      location: {
        maxlength: 1024
      },
      class: {
        default: 'PUBLIC',
        values: [
          {
            value: 'PUBLIC',
            label: 'Public'
          },
          {
            value: 'CONFIDENTIAL',
            label: 'Show time and date only'
          },
          {
            value: 'PRIVATE',
            label: 'Private'
          }
        ]
      }
    })

    .constant('CAL_AUTOCOMPLETE_MAX_RESULTS', 5)

    .constant('CAL_AUTOCOMPLETE_DEFAULT_PLACEHOLDER', 'Search')

    .constant('CAL_DAV_PATH', '/dav/api')

    .constant('CAL_GRACE_DELAY', 10000)

    .constant('CAL_GRACE_DELAY_IS_ACTIVE', false)

    .constant('CAL_ERROR_DISPLAY_DELAY', 8000)

    .constant('CAL_RESIZE_DEBOUNCE_DELAY', 250)

    .constant('CAL_USER_CACHE_TTL', 3600000)

    .constant('CAL_ATTENDEES_CACHE_TTL', 3600000)

    /**
     * When checking if an event has been modified in the event form, these JSON
     * keys on the calendar shell will be checked.
     */
    .constant('CAL_EVENT_MODIFY_COMPARE_KEYS', ['attendees', 'title', 'start', 'end', 'allDay', 'location', 'description', 'rrule', 'alarm', 'class', 'xOpenpaasVideoconference'])

    /**
     * When checking rrule comparison, these JSON keys on the rrule shell will be checked.
     */
    .constant('CAL_RRULE_MODIFY_COMPARE_KEYS', ['freq', 'interval', 'until', 'count', 'byday'])

    /**
     * When checking alarm comparison, these JSON keys on the alarm shell will be checked.
     */
    .constant('CAL_ALARM_MODIFY_COMPARE_KEYS', ['action', 'attendee', 'description', 'summary', 'trigger'])

    /**
     * see RFC 5546 https://tools.ietf.org/html/rfc5546#page-11
     */
    .constant('CAL_SIGNIFICANT_CHANGE_KEYS', ['start', 'end', 'duration', 'due', 'rrule', 'rdate', 'exdate', 'status'])

    .constant('CAL_CALENDAR_MODIFY_COMPARE_KEYS', ['name', 'color'])

    .constant('CAL_MASTER_EVENT_CACHE_TTL', 300000)

    .constant('CAL_SPINNER_TIMEOUT_DURATION', 2000)

    .constant('CAL_EVENT_FORM_SPINNER_TIMEOUT_DURATION', 500)

    .constant('CAL_EVENTS', {
      CALENDAR_HEIGHT: 'calendar:height',
      CALENDAR_REFRESH: 'calendar:refresh',
      CALENDAR_UNSELECT: 'calendar:unselect',
      EVENT_ATTENDEES_UPDATE: 'calendar:eventAttendeesUpdate',
      HOME_CALENDAR_VIEW_CHANGE: 'calendar:homeViewChange',
      ITEM_ADD: 'calendar:itemAdd',
      ITEM_MODIFICATION: 'calendar:itemModification',
      ITEM_REMOVE: 'calendar:itemRemove',
      REVERT_MODIFICATION: 'calendar:revertModification',
      VIEW_TRANSLATION: 'calendar:viewTranslation',
      CALENDARS: {
        ADD: 'calendar:calendars:add',
        REMOVE: 'calendar:calendars:remove',
        UPDATE: 'calendar:calendars:update',
        TOGGLE_VIEW: 'calendar:calendars:toggleView',
        TOGGLE_VIEW_MODE: 'calendar:calendars:toggleViewMode',
        TODAY: 'calendar:calendars:today',
        RIGHTS_UPDATE: 'calendar:calendars:rightsUpdate'
      },
      MINI_CALENDAR: {
        DATE_CHANGE: 'calendar:mini:dateChange',
        TOGGLE: 'calendar:mini:toggle',
        VIEW_CHANGE: 'calendar:mini:viewchange'
      },
      MODAL: 'calendar:modal'
    })

    .constant('CAL_MAX_DURATION_OF_SMALL_EVENT', {
      MOBILE: 60,
      DESKTOP: 45
    })

    .constant('CAL_MODULE_METADATA', {
      id: 'linagora.esn.calendar',
      title: 'Calendar',
      icon: '/calendar/images/calendar-icon.svg',
      homePage: 'calendar.main',
      config: {
        template: 'calendar-config-form',
        displayIn: {
          user: false,
          domain: true,
          platform: true
        }
      },
      disableable: true,
      isDisplayedByDefault: true
    })

    .constant('CAL_WEBSOCKET', {
      NAMESPACE: '/calendars',
      EVENT: {
        CREATED: 'calendar:event:created',
        UPDATED: 'calendar:event:updated',
        REQUEST: 'calendar:event:request',
        CANCEL: 'calendar:event:cancel',
        DELETED: 'calendar:event:deleted',
        REPLY: 'calendar:event:reply'
      },
      CALENDAR: {
        CREATED: 'calendar:calendar:created',
        UPDATED: 'calendar:calendar:updated',
        DELETED: 'calendar:calendar:deleted'
      },
      SUBSCRIPTION: {
        CREATED: 'calendar:subscription:created',
        UPDATED: 'calendar:subscription:updated',
        DELETED: 'calendar:subscription:deleted'
      }
    })

    .constant('CAL_LIST_OF_COLORS', {
      red: '#F44336',
      pink: '#E91E63',
      purple: '#9C27B0',
      indigo: '#3F51B5',
      blue: '#2196F3',
      teal: '#009688',
      green: '#4CAF50',
      amber: '#FFC107',
      orange: '#FF9800',
      brown: '#795548'
    })

    .constant('CAL_RECUR_FREQ', [{
      value: undefined,
      label: 'No repetition'
    }, {
      value: 'DAILY',
      label: 'Repeat daily'
    }, {
      value: 'WEEKLY',
      label: 'Repeat weekly'
    }, {
      value: 'MONTHLY',
      label: 'Repeat monthly'
    }, {
      value: 'YEARLY',
      label: 'Repeat yearly'
    }])

    .constant('CAL_WEEK_DAYS', [
      {label: 'Monday', value: 'MO'},
      {label: 'Tuesday', value: 'TU'},
      {label: 'Wednesday', value: 'WE'},
      {label: 'Thursday', value: 'TH'},
      {label: 'Friday', value: 'FR'},
      {label: 'Saturday', value: 'SA'},
      {label: 'Sunday', value: 'SU'}
    ])

    .constant('CAL_MINI_CALENDAR_DAY_FORMAT', 'YYYY-MM-DD')

    .constant('CAL_CONSULT_FORM_TABS', {
      MAIN: 'main',
      ATTENDEES: 'attendees',
      MORE: 'more'
    })

    .constant('CAL_CACHED_EVENT_SOURCE_ADD', 'add')

    .constant('CAL_CACHED_EVENT_SOURCE_DELETE', 'delete')

    .constant('CAL_CACHED_EVENT_SOURCE_UPDATE', 'update')

    .constant('CAL_REDRAW_MULTI_DAY_EVENT', 'redraw')

    .constant('CAL_ALARM_TRIGGER', [{
      value: undefined,
      label: 'No alarm'
    }, {
      value: '-PT1M',
      label: '1 minute'
    }, {
      value: '-PT5M',
      label: '5 minutes'
    }, {
      value: '-PT10M',
      label: '10 minutes'
    }, {
      value: '-PT15M',
      label: '15 minutes'
    }, {
      value: '-PT30M',
      label: '30 minutes'
    }, {
      value: '-PT1H',
      label: '1 hour'
    }, {
      value: '-PT2H',
      label: '2 hours'
    }, {
      value: '-PT5H',
      label: '5 hours'
    }, {
      value: '-PT12H',
      label: '12 hours'
    }, {
      value: '-P1D',
      label: '1 day'
    }, {
      value: '-P2D',
      label: '2 days'
    }, {
      value: '-P1W',
      label: '1 week'
    }])
    .constant('CAL_USER_CONFIGURATION', {
      moduleName: 'linagora.esn.calendar',
      keys: ['workingDays', 'hideDeclinedEvents']
    })
    .constant('CAL_CORE_CONFIGURATION', {
      keys: ['datetime']
    })
    // See https://github.com/fullcalendar/fullcalendar/tree/master/locale
    .constant('CAL_FULLCALENDAR_LOCALE', {
      default: 'en',
      support: [
      'ar-ma',
      'ar-sa',
      'ar-tn',
      'ar',
      'bg',
      'ca',
      'cs',
      'da',
      'de-at',
      'de',
      'el',
      'en-au',
      'en-ca',
      'en-gb',
      'en-ie',
      'en-nz',
      'es-do',
      'es',
      'eu',
      'fa',
      'fi',
      'fr-ca',
      'fr-ch',
      'fr',
      'gl',
      'he',
      'hi',
      'hr',
      'hu',
      'id',
      'is',
      'it',
      'ja',
      'ko',
      'lb',
      'lt',
      'lv',
      'mk',
      'ms-my',
      'ms',
      'nb',
      'nl',
      'nn',
      'pl',
      'pt-br',
      'pt',
      'ro',
      'ru',
      'sk',
      'sl',
      'sr-cyrl',
      'sr',
      'sv',
      'th',
      'tr',
      'uk',
      'vi',
      'zh-cn',
      'zh-tw'
    ]})

    .constant('CAL_ADVANCED_SEARCH_CALENDAR_TYPES', {
      ALL_CALENDARS: 'allCalendars',
      MY_CALENDARS: 'myCalendars',
      SHARED_CALENDARS: 'sharedCalendars'
    });
})();
