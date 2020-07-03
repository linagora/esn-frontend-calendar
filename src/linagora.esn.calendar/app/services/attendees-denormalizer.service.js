(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .factory('calAttendeesDenormalizerService', calAttendeesDenormalizerService);

  function calAttendeesDenormalizerService(
    _,
    $q,
    userAPI,
    calAttendeeService,
    esnMemberResolverRegistry
  ) {
    var identityResolver = _.identity;

    var resolvers = {
      group: groupMemberResolver,
      individual: identityResolver,
      resource: identityResolver,
      ldap: ldapResolver
    };

    return denormalize;

    function denormalize(attendees) {
      return $q.all(attendees.map(function(attendee) {
        return (attendee.cutype ? resolvers[attendee.cutype.toLowerCase()] || identityResolver : identityResolver)(attendee);
      })).then(function(results) {
        return _.flatten(results);
      });
    }

    function groupMemberResolver(attendee) {
      var memberTransformers = {
        user: function(attendee) {
          return $q.when(calAttendeeService.userAsAttendee(attendee));
        },
        email: function(attendee) {
          return $q.when(calAttendeeService.emailAsAttendee(attendee));
        },
        group: groupMemberResolver
      };
      var resolver = esnMemberResolverRegistry.getResolver('group');

      if (!resolver) {
        return attendee;
      }

      return resolver.resolve(attendee.email).then(function(members) {
        return $q.all(members.map(function(member) {
          var memberTransformer = memberTransformers[member.objectType];

          if (!memberTransformer) {
            return calAttendeeService.emailAsAttendee(member.member);
          }

          return memberTransformer(member.member);
        }));
      });
    }

    /**
     * Ldap resolver
     * This resolver will try to provision attendee who comes from LDAP
     * If success to provision, the attendee will be added as an ESN user
     * Otherwise, attendee will be added as an email
     *
     * @param {Object} attendee ldap attendee to provision
     * @return {Promise} resolve with provisioned attendee
     */
    function ldapResolver(attendee) {
      return userAPI.provisionUsers('ldap', [attendee.email])
        .then(function(provisonedUsers) {
          if (provisonedUsers && provisonedUsers[0]) {
            return calAttendeeService.userAsAttendee(provisonedUsers[0]);
          }

          return calAttendeeService.emailAsAttendee(attendee.email);
        })
        .catch(function() {
          return calAttendeeService.emailAsAttendee(attendee.email);
        });
    }
  }
})(angular);
