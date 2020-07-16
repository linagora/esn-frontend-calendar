
  angular.module('esnApp')
    .config(function ($urlRouterProvider) {
      $urlRouterProvider.otherwise(function () {
        return '/calendar';
      });
    });
