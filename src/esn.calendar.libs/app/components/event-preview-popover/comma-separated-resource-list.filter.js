
angular.module('esn.calendar.libs')
  .filter('commaSeparatedResourceList', attendeePartStatText);

function attendeePartStatText() {
  return function(resources = []) {
    return resources.map(resource => resource.displayName).join(', ');
  };
}
