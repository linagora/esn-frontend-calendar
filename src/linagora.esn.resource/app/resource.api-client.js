(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .factory('esnResourceAPIClient', esnResourceAPIClient);

  function esnResourceAPIClient(esnResourceRestangular) {
    return {
      create: create,
      get: get,
      list: list,
      remove: remove,
      search: search,
      update: update
    };

    function create(resource) {
      return _getResources().post(resource);
    }

    function update(resource) {
      return _getResources().one(resource._id).customPUT(resource);
    }

    function get(id) {
      return _getResources().one(id).get();
    }

    function list(options) {
      return _getResources().getList(options);
    }

    function search(query, limit, offset) {
      var options = {
        query: query,
        limit: limit,
        offset: offset
      };

      return list(options);
    }

    function _getResources() {
      return esnResourceRestangular.all('resources');
    }

    function remove(id) {
      return _getResources().one(id).remove();
    }
  }
})(angular);
