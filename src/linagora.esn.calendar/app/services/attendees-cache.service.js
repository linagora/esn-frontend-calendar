(function(angular) {
  'use strict';

  angular.module('esn.calendar').factory('calAttendeesCache', calAttendeesCache);

    function calAttendeesCache(Cache, userAPI, userUtils, CAL_ATTENDEES_CACHE_TTL) {
      var cache = new Cache({
        loader: _userLoader,
        ttl: CAL_ATTENDEES_CACHE_TTL
      });

      return cache;

      ////////
      function _userLoader(email) {
        return userAPI.getUsersByEmail(email).then(function(result) {
          return result.data && result.data.length && result.data[0];
      });
    }
  }
})(angular);
