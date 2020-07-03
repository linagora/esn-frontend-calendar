'use strict';

/* global chai: false */

var expect = chai.expect;

describe('the userAndExternalCalendars service', function() {
  var calendars, userAndExternalCalendars;

  beforeEach(function() {
    calendars = [{
      id: '1',
      href: 'href',
      name: 'name',
      color: 'color',
      description: 'Personal calendar that is public',
      rights: {
        getOwnerId: function() {
          return 'tata';
        }
      },
      isShared: function() {
        return false;
      },
      isPublic: function() {
        return true;
      },
      isOwner: function() {
        return true;
      },
      isSubscription: function() {
        return false;
      }
    }, {
      id: '2',
      href: 'href2',
      name: 'name2',
      color: 'color2',
      description: 'Personal calendar that is shared',
      rights: {
        getOwnerId: function() {
          return 'tata';
        }
      },
      isShared: function() {
        return true;
      },
      isPublic: function() {
        return false;
      },
      isOwner: function() {
        return true;
      },
      isSubscription: function() {
        return false;
      }
    }, {
      id: '3',
      href: 'href',
      name: 'name',
      color: 'color',
      description: 'Personal calendar that is shared and public',
      rights: {
        getOwnerId: function() {
          return 'tata';
        }
      },
      isShared: function() {
        return true;
      },
      isPublic: function() {
        return true;
      },
      isOwner: function() {
        return true;
      },
      isSubscription: function() {
        return false;
      }
    }, {
      id: '4',
      href: 'href',
      name: 'name',
      color: 'color',
      description: 'Subscription to public calendar',
      rights: {
        getOwnerId: function() {
          return 'tata';
        }
      },
      isShared: function() {
        return false;
      },
      isPublic: function() {
        return true;
      },
      isOwner: function() {
        return false;
      },
      isSubscription: function() {
        return true;
      }
    }, {
      id: '5',
      href: 'href',
      name: 'name',
      color: 'color',
      description: 'Calendar shared to me',
      rights: {
        getOwnerId: function() {
          return 'tata';
        }
      },
      isShared: function() {
        return true;
      },
      isPublic: function() {
        return false;
      },
      isOwner: function() {
        return false;
      },
      isSubscription: function() {
        return false;
      }
    }, {
      id: '6',
      href: 'href',
      name: 'name',
      color: 'color',
      description: 'Calendar shared to me and public (not subscribed)',
      rights: {
        getOwnerId: function() {
          return 'tata';
        }
      },
      isShared: function() {
        return true;
      },
      isPublic: function() {
        return true;
      },
      isOwner: function() {
        return false;
      },
      isSubscription: function() {
        return false;
      }
    }, {
      id: '7',
      href: 'href',
      name: 'name',
      color: 'color',
      description: 'Subscription to public calendar that is also shared to me',
      rights: {
        getOwnerId: function() {
          return 'tata';
        }
      },
      isShared: function() {
        return true;
      },
      isPublic: function() {
        return true;
      },
      isOwner: function() {
        return false;
      },
      isSubscription: function() {
        return true;
      }
    }];

    angular.mock.module('esn.calendar');

    angular.mock.inject(function(_userAndExternalCalendars_) {
      userAndExternalCalendars = _userAndExternalCalendars_;
    });
  });

  beforeEach(function() {
    userAndExternalCalendars = userAndExternalCalendars(calendars);
  });

  it('should initialize userCalendars with calendars that have no rights', function() {
    expect(userAndExternalCalendars.userCalendars).to.contain(calendars[0]);
  });

  it('should initialize userCalendars with calendars that belong to the current user', function() {
    expect(userAndExternalCalendars.userCalendars).to.contain(calendars[1], calendars[2]);
  });

  it('should initialize userCalendars with calendars that belong to the current user even if they are shared', function() {
    expect(userAndExternalCalendars.userCalendars).to.deep.equal([calendars[0], calendars[1], calendars[2]]);
  });

  it('should initialize sharedCalendars with calendars that are shared and dont belong to the current user', function() {
    expect(userAndExternalCalendars.sharedCalendars).to.contain(calendars[4], calendars[5]);
  });

  it('should initialize publicCalendars with calendars that are from subscriptions', function() {
    expect(userAndExternalCalendars.publicCalendars).to.contain(calendars[3], calendars[6]);
  });

  it('should spread calendars on personal, shared and public calendars without duplicates', function() {
    var result = userAndExternalCalendars.publicCalendars.concat(userAndExternalCalendars.sharedCalendars).concat(userAndExternalCalendars.userCalendars);
    expect(result).to.have.same.members(calendars);
  });
});
