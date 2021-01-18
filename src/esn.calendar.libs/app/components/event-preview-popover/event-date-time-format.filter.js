angular.module('esn.calendar.libs')
  .filter('eventDateTimeFormat', attendeePartStatText);

function attendeePartStatText(calMoment, esnDatetimeService, esnI18nService) {
  return function(datetimes = []) {
    const locale = esnI18nService.getLocale();
    const is24HourFormat = esnDatetimeService.is24hourFormat();
    let start = datetimes[0].locale(locale);
    let end = datetimes[1].locale(locale);
    const durationAsDays = calMoment.duration(end.diff(start)).asDays();

    if (durationAsDays < 1) {
      return `${start.format('dddd')}, ${start.format('LL')} • ${start.format(is24HourFormat ? 'HH:mm' : 'hh:mm')} – ${end.format(is24HourFormat ? 'HH:mm' : 'hh:mm A')}`;
    }

    if (!start.hasTime() && !end.hasTime()) {
      start = calMoment(start);
      end = calMoment(end).subtract(1, 'days');

      if (durationAsDays === 1) {
        return `${start.format('dddd')}, ${start.format('LL')}`;
      }

      return `${start.format('dddd')}, ${start.format('LL')} – ${end.format('dddd')}, ${end.format('LL')}`;
    }

    return `${start.format('dddd')}, ${start.format('LL')} ${start.format(is24HourFormat ? 'HH:mm' : 'hh:mm A')} – ${end.format('dddd')}, ${end.format('LL')} ${end.format(is24HourFormat ? 'HH:mm' : 'hh:mm A')}`;
  };
}
