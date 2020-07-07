require('../../services/websocket/listener.service.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .run(runBlock);

  function runBlock(calWebsocketListenerService) {
    calWebsocketListenerService.listenEvents();
  }
})(angular);
