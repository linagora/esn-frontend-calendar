(function() {
  'use strict';

  angular.module('esn.calendar')
         .factory('calFullUiConfiguration', calFullUiConfiguration);

  function calFullUiConfiguration(
    $q,
    esnI18nService,
    calBusinessHoursService,
    esnDatetimeService,
    esnUserConfigurationService,
    moment,
    _,
    CAL_UI_CONFIG,
    CAL_USER_CONFIGURATION,
    CAL_FULLCALENDAR_LOCALE
  ) {
    var _isDeclinedEventsHidden = false;

    var handler = {
      workingDays: _workingDays,
      hideDeclinedEvents: _hideDeclinedEvents
    };

    var service = {
      configureLocaleForCalendar: configureLocaleForCalendar,
      configureTimeFormatForCalendar: configureTimeFormatForCalendar,
      configureTimeZoneForCalendar: configureTimeZoneForCalendar,
      get: get,
      isDeclinedEventsHidden: isDeclinedEventsHidden,
      setHiddenDeclinedEvents: setHiddenDeclinedEvents
    };

    return service;

    ////////////

    function get() {
      return esnUserConfigurationService.get(CAL_USER_CONFIGURATION.keys, CAL_USER_CONFIGURATION.moduleName)
        .then(function(configurations) {
          var setConfigurations = configurations.map(function(configuration) {
            if (!handler[configuration.name] || !configuration.value) {
              return {};
            }

            return handler[configuration.name]();
          });

          return $q.all(setConfigurations);
        })
        .then(function(configurationsSetted) {
          var uiConfig = angular.copy(CAL_UI_CONFIG);

          configurationsSetted.push(CAL_UI_CONFIG.calendar);
          uiConfig.calendar = angular.extend.apply(null, configurationsSetted);

          return uiConfig;
        })
        .then(configureLocaleForCalendar)
        .then(configureTimeFormatForCalendar)
        .then(configureTimeZoneForCalendar);
    }

    function _workingDays() {
      function hasDowKey(businessHour) {
        return _.has(businessHour, 'dow');
      }

      return calBusinessHoursService.getUserBusinessHours().then(function(userBusinessHours) {
        var workingDays = _.result(_.find(userBusinessHours, hasDowKey), 'dow') || CAL_UI_CONFIG.calendarDefaultDaysValue;

        return { hiddenDays: _.difference(CAL_UI_CONFIG.calendarDaysValue, workingDays) };
      });
    }

    function _hideDeclinedEvents() {
      setHiddenDeclinedEvents(true);

      return {};
    }

    function setHiddenDeclinedEvents(status) {
      _isDeclinedEventsHidden = status;
    }

    function isDeclinedEventsHidden() {
      return _isDeclinedEventsHidden;
    }

    function configureLocaleForCalendar(config) {
      var uiConfig = angular.extend({}, config);
      var currentLocale = esnI18nService.getLocale();

      var calendarLocale = _findFullCalendarLocale(currentLocale);

      uiConfig.calendar.locale = calendarLocale;

      return uiConfig;
    }

    function configureTimeFormatForCalendar(config) {
      var uiConfig = angular.extend({}, config);
      var timeFormat = esnDatetimeService.getTimeFormat();

      uiConfig.calendar.timeFormat = timeFormat;
      uiConfig.calendar.slotLabelFormat = timeFormat;

      return uiConfig;
    }

    function configureTimeZoneForCalendar(config) {
      var uiConfig = angular.extend({}, config);
      var timeZone = esnDatetimeService.getTimeZone();
      uiConfig.calendar.timezone = timeZone;
      return uiConfig;
    }

    function _findFullCalendarLocale(locale) {
      if (locale === 'zh') locale = 'zh-tw';

      return locale.replace(/([a-zA-Z]+)([\W_]+)?([a-zA-Z]+)?/g, function(match, language, separator, country) {
        var languageAndCountryLocale = language && country ? language.toLowerCase() + '-' + country.toLowerCase() : null;
        var languageLocale = language ? language.toLowerCase() : null;
        var localeAlternatives = [
          CAL_FULLCALENDAR_LOCALE.support.indexOf(languageAndCountryLocale) > -1 ? languageAndCountryLocale : null,
          CAL_FULLCALENDAR_LOCALE.support.indexOf(languageLocale) > -1 ? languageLocale : null,
          CAL_FULLCALENDAR_LOCALE.default
        ];

        function firstLocaleSupported() {
          return _.find(localeAlternatives, function(locale) { return !!locale; });
        }

        return firstLocaleSupported();
      });
    }
  }
})();
