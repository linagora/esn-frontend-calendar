(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('esnCalendarController', esnCalendarController);

    function esnCalendarController($element, $log, $tooltip, esnI18nService, _) {
      var self = this;

      self.$onInit = $onInit;

      var div = $element.children();

      function $onInit() {
        var config = _.clone(self.config);

        config.viewRender = function() {
          self.config.viewRender && self.config.viewRender.apply(this, arguments);

          self.calendarReady({
            fullCalendar: function() {
              try {
                return div.fullCalendar.apply(div, arguments);
              } catch (e) {
                $log.error(e);
              }
            },
            offset: div.offset.bind(div)
          });
        };

        div.fullCalendar(config);

        _.forEach({
          Day: '.fc-agendaDay-button',
          Week: '.fc-agendaWeek-button',
          Month: '.fc-month-button',
          Next: '.fc-next-button',
          Previous: '.fc-prev-button'
        }, function(selector, title) {
          var element = div.find(selector);

          element.length && $tooltip(element, {
            title: esnI18nService.translate(title).toString(),
            placement: 'bottom',
            container: 'body'
          });
        });
      }
    }
})(angular);
