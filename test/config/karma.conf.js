'use strict';

var webpackConfig = require('../../webpack.test');

module.exports = function(config) {
  var singleRun = process.env.SINGLE_RUN ? process.env.SINGLE_RUN !== 'false' : true;

  config.set({
    basePath: '../../',
    files: [
      'src/index.test.js',
      'test/fixtures/*.js',
      'test/unit-frontend/fixtures/**',
      'src/linagora.esn.calendar/app/fixtures/**',
      '**/*.pug'
    ],
    exclude: [
      'node_modules/esn-frontend-common-libs/src/frontend/**/*.spec.js',
      'node_modules/esn-frontend-common-libs/src/frontend/js/esn/app.js',
      'src/linagora.esn.calendar/app/search/search.run.js',
      'src/linagora.esn.calendar/app/module-registry.run.js',
      'src/linagora.esn.calendar/app/configuration/configuration.run.js',
      'src/linagora.esn.calendar/app/services/cal-default-value.run.js',
      'src/linagora.esn.calendar/app/services/websocket/listener.run.js',
      'src/linagora.esn.calendar/event-consultation-app/app.js',
      'src/linagora.esn.calendar/event-consultation-app/error.js',
      'src/linagora.esn.calendar/event-consultation-app/error-display/**/*.js'
    ],
    frameworks: ['mocha', 'sinon-chai'],
    colors: true,
    singleRun: singleRun,
    autoWatch: true,
    browsers: ['FirefoxHeadless'/*,'ChromeHeadless'*/],

    customLaunchers: {
      FirefoxHeadless: {base: 'Firefox', flags: ['--headless']},
      ChromeHeadless: {base: 'Chrome', flags: ['--headless', '--disable-gpu']},
      Chrome_with_debugging: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9222'],
        debug: true
      }
    },

    proxies: {
      '/images/': '/base/frontend/images/'
    },

    reporters: singleRun ? ['coverage', 'spec'] : ['spec'],

    preprocessors: {
      'src/index.test.js': ['webpack'],
      '**/*.pug': ['ng-jade2module'],
      'test/fixtures/**': ['raw2js'],
      'src/linagora.esn.calendar/app/fixtures/**': ['raw2js'],
      'test/unit-frontend/fixtures/**': ['raw2js']
    },

    webpack: webpackConfig,
    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-webpack',
      'karma-coverage',
      'karma-spec-reporter',
      'karma-sinon-chai',
      '@linagora/karma-ng-jade2module-preprocessor',
      'karma-rawfixtures-preprocessor'
    ],

    coverageReporter: {type: 'text', dir: '/tmp'},

    ngJade2ModulePreprocessor: {
      cacheIdFromPath: function(filepath) {
        return filepath
          .replace(/pug$/, 'html')
          .replace(/^src\/linagora.esn.calendar/, '/calendar')
          .replace(/^src\/linagora.esn.resource/, '/resource')
          .replace(/^node_modules\/esn-frontend-common-libs\/src\/frontend/, '');
      },
      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('templates')
      jadeRenderOptions: {
        basedir: require('path').resolve(__dirname, '../../node_modules/esn-frontend-common-libs/src/frontend/views')
      },
      jadeRenderLocals: {
        __: function(str) {
          return str;
        }
      },
      moduleName: 'jadeTemplates'
    }

  });
};
