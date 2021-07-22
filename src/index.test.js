window.jQuery = require('jquery/dist/jquery.js');
window.$ = window.jQuery;
require('jquery-ui/ui/widgets/draggable.js');
require('esn-frontend-common-libs/src/frontend/vendor-libs.js');
require('esn-frontend-common-libs/src/frontend/js/material.js');
require('esn-frontend-common-libs/src/frontend/js/modules/session.js');
require('esn-frontend-videoconference-calendar/src/linagora.esn.videoconference/app/videoconference.module.js');
require('esn-frontend-videoconference-calendar/src/linagora.esn.videoconference.calendar/app/videoconference-calendar.module.js');
require('angular-moment/angular-moment.js');
require('angular-strap/dist/angular-strap.js');
require('angular-animate/angular-animate.js');
require('angular-messages/angular-messages.js');
require('angular-feature-flags/dist/featureFlags.js');
require('angular-ui-router/release/angular-ui-router.js');
require('angular-material/angular-material.js');
require('matchmedia-ng/matchmedia-ng.js');
require('bootstrap/dist/js/bootstrap.js');
require('angular-promise-extras/angular-promise-extras.js');
require('angular-touch/angular-touch.js');
require('ng-tags-input/build/ng-tags-input.js');
require('fullcalendar/dist/fullcalendar.js');
require('moment-timezone/builds/moment-timezone-with-data-2012-2022.js');
require('async/dist/async.js');
require('esn-frontend-mailto-handler/src/index.js');
require('angular-mocks/angular-mocks.js');

require('./app/app.js');

require('../test/config/mocks/injector.js');
require('../test/config/mocks/modules.js');
require('../test/config/mocks/ng-mock-component.js');
require('../test/config/mocks/reset-dynamic-directive-injections.js');
require('../test/fixtures/errors.js');
require('../test/fixtures/logger-noop.js');

const sinonChai = require('sinon-chai/lib/sinon-chai.js');
const shallowDeepEqual = require('chai-shallow-deep-equal/chai-shallow-deep-equal.js');
const chaiDatetime = require('chai-datetime/chai-datetime.js');

/* global chai */
chai.use(sinonChai);
chai.use(shallowDeepEqual);
chai.use(chaiDatetime);

// require all test files using special Webpack feature
// https://webpack.github.io/docs/context.html#require-context
const testsContext = require.context('.', true, /\.spec$/);

testsContext.keys().forEach(testsContext);
