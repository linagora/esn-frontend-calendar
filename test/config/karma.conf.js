'use strict';

const webpackConfig = require('../../webpack.test');

module.exports = function(config) {
  const singleRun = process.env.SINGLE_RUN !== 'false';

  config.set({
    basePath: '../../',
    files: [
      'src/index.test.js',
      'test/fixtures/*.js',
      'test/unit-frontend/fixtures/**',
      'src/linagora.esn.calendar/app/fixtures/**',
    ],
    frameworks: ['mocha', 'sinon-chai'],
    colors: true,
    singleRun,
    autoWatch: true,
    browsers: ['FirefoxHeadless'],

    customLaunchers: {
      FirefoxHeadless: {base: 'Firefox', flags: ['--headless']}
    },

    proxies: {
      '/images/': '/base/frontend/images/'
    },

    reporters: ['spec'],

    preprocessors: {
      'src/index.test.js': ['webpack'],
      'test/fixtures/**': ['raw2js'],
      'src/linagora.esn.calendar/app/fixtures/**': ['raw2js'],
      'test/unit-frontend/fixtures/**': ['raw2js']
    },

    webpack: webpackConfig,
    plugins: [
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-webpack',
      'karma-spec-reporter',
      'karma-sinon-chai',
      'karma-rawfixtures-preprocessor'
    ]
  });
};
