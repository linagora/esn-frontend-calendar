angular.module('esn.calendar.libs')
  .filter('attendeePartStatText', attendeePartStatText);

function attendeePartStatText(esnI18nService, CAL_ICAL) {
  return function(attendees = []) {
    const partCountMapping = {
      needsaction: attendees.filter(attendee => attendee.partstat === CAL_ICAL.partstat.needsaction).length,
      accepted: attendees.filter(attendee => attendee.partstat === CAL_ICAL.partstat.accepted).length,
      declined: attendees.filter(attendee => attendee.partstat === CAL_ICAL.partstat.declined).length,
      tentative: attendees.filter(attendee => attendee.partstat === CAL_ICAL.partstat.tentative).length
    };

    let eventPartStatText = '';

    if (partCountMapping.accepted > 0) eventPartStatText += `${partCountMapping.accepted} ${esnI18nService.translate('yes')}, `;
    if (partCountMapping.tentative > 0) eventPartStatText += `${partCountMapping.tentative} ${esnI18nService.translate('maybe')}, `;
    if (partCountMapping.declined > 0) eventPartStatText += `${partCountMapping.declined} ${esnI18nService.translate('no')}, `;
    if (partCountMapping.needsaction > 0) eventPartStatText += `${partCountMapping.needsaction} ${esnI18nService.translate('waiting')}`;
    else eventPartStatText = eventPartStatText.slice(0, eventPartStatText.length - 2);

    return eventPartStatText;
  };
}
