const injections = require('esn-frontend-common-libs/src/require-angular-injections.js');

injections.push('esn.resource.libs');
injections.push('esn.calendar.libs');
injections.push('esn.calendar');
injections.push('linagora.esn.resource');

module.exports = injections;
