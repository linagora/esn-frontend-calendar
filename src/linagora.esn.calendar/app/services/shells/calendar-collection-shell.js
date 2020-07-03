(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('CalendarCollectionShell', CalendarCollectionShellFactory);

  function CalendarCollectionShellFactory(
    _,
    calendarUtils,
    calPathBuilder,
    calPathParser,
    calendarUsersCache,
    calDefaultValue,
    CalendarRightShell,
    calResourceService,
    session,
    CAL_DEFAULT_EVENT_COLOR,
    CAL_CALENDAR_PUBLIC_RIGHT,
    CAL_CALENDAR_SHARED_RIGHT,
    CAL_CALENDAR_PROPERTIES,
    CAL_CALENDAR_TYPE,
    CAL_DEFAULT_NAME,
    CAL_OLD_DEFAULT_ID
  ) {
    /**
     * A shell that wraps an caldav calendar component.
     * Note that href is the unique identifier and id is the calendarId inside the calendarHomeId
     * @param {Object} calendar            The caldav calendar component.
     * @param {Object} extendedProperties  Object of additional properties like:
     */
    function CalendarCollectionShell(calendar) {
      var ownerId;

      this.name = calendar[CAL_CALENDAR_PROPERTIES.name] === CAL_DEFAULT_NAME ? calendarUtils.getTranslatedDefaultName() : calendar[CAL_CALENDAR_PROPERTIES.name];
      this.color = calendar[CAL_CALENDAR_PROPERTIES.color] || CAL_DEFAULT_EVENT_COLOR;
      this.description = calendar[CAL_CALENDAR_PROPERTIES.description] || '';
      this.source = calendar[CAL_CALENDAR_PROPERTIES.source] && getCalendarCollectionShell(calendar[CAL_CALENDAR_PROPERTIES.source]);
      this.delegatedsource = calendar[CAL_CALENDAR_PROPERTIES.delegatedsource];

      this.href = calendar._links.self.href;

      var parsedPath = calPathParser.parseCalendarPath(this.href);

      this.id = parsedPath.calendarId;
      this.calendarHomeId = parsedPath.calendarHomeId;
      this.selected = this.id === calDefaultValue.get('calendarId');

      this.invite = calendar.invite || this.source && this.source.invite;

      var self = this;

      if (_.has(this.source, 'href')) {
        ownerId = calPathParser.parseCalendarPath(self.source.href).calendarHomeId;
        self.acl = self.source.acl;
      } else {
        ownerId = undefined;
        self.acl = calendar.acl;
      }

      this.rights = new CalendarRightShell(this.acl, this.invite, ownerId);
      this.type = this.rights._type;
      this.readOnly = !this.isWritable(session.user._id);
    }

    Object.defineProperty(CalendarCollectionShell.prototype, 'uniqueId', { get: function() { return calPathBuilder.forCalendarId(this.calendarHomeId, this.id); } });

    CalendarCollectionShell.prototype.getOwner = getOwner;
    CalendarCollectionShell.prototype.getUniqueId = getUniqueId;
    CalendarCollectionShell.prototype.isAdmin = isAdmin;
    CalendarCollectionShell.prototype.isDelegated = isDelegated;
    CalendarCollectionShell.prototype.isOwner = isOwner;
    CalendarCollectionShell.prototype.isPublic = isPublic;
    CalendarCollectionShell.prototype.isReadable = isReadable;
    CalendarCollectionShell.prototype.isShared = isShared;
    CalendarCollectionShell.prototype.isSubscription = isSubscription;
    CalendarCollectionShell.prototype.isResource = isResource;
    CalendarCollectionShell.prototype.isWritable = isWritable;
    CalendarCollectionShell.prototype.getCalendarType = getCalendarType;
    CalendarCollectionShell.prototype.getResourceId = getResourceId;
    CalendarCollectionShell.prototype.isOldDefaultCalendar = isOldDefaultCalendar;

    CalendarCollectionShell.toDavCalendar = toDavCalendar;
    CalendarCollectionShell.from = from;
    CalendarCollectionShell.buildHref = buildHref;
    CalendarCollectionShell.buildUniqueId = buildHref;
    CalendarCollectionShell.splitUniqueId = splitUniqueId;

    return CalendarCollectionShell;

    ////////////

    /**
     * Return a dav:calendar used in body of request about calendars
     * Note that it's only used when creating a calendar for now.
     * @param  {Object} shell  a CalendarCollectionShell or an object like {href: '', name: '', color: '', description: ''}
     * @returns {Object}        {'dav:name': '', 'apple:color': '', 'caldav:description': ''}
     */
    function toDavCalendar(shell) {
      if (!(shell instanceof CalendarCollectionShell)) {
        shell = CalendarCollectionShell.from(shell);
      }

      var toDavCalendarObject = {
        id: shell.id,
        acl: shell.acl,
        invite: shell.invite
      };

      toDavCalendarObject[CAL_CALENDAR_PROPERTIES.name] = shell.name;
      toDavCalendarObject[CAL_CALENDAR_PROPERTIES.color] = shell.color;
      toDavCalendarObject[CAL_CALENDAR_PROPERTIES.description] = shell.description;
      toDavCalendarObject[CAL_CALENDAR_PROPERTIES.source] = shell.source;

      return toDavCalendarObject;
    }

    /**
     * Take an object and return a CalendarCollectionShell
     * @param  {Object} object like {href: '', name: '', color: '', description: ''}
     * @returns {CalendarCollectionShell}        the new CalendarCollectionShell
     */
    function from(object) {
      var calendarCollectionShellObject = {
        _links: {
          self: { href: object.href }
        },
        acl: object.acl,
        invite: object.invite
      };

      calendarCollectionShellObject[CAL_CALENDAR_PROPERTIES.name] = object.name;
      calendarCollectionShellObject[CAL_CALENDAR_PROPERTIES.color] = object.color;
      calendarCollectionShellObject[CAL_CALENDAR_PROPERTIES.description] = object.description;
      calendarCollectionShellObject[CAL_CALENDAR_PROPERTIES.source] = object.source;

      return new CalendarCollectionShell(calendarCollectionShellObject);
    }

    function buildHref(calendarHomeId, calendarId) {
      return calPathBuilder.forCalendarId(calendarHomeId, calendarId);
    }

    function splitUniqueId(uniqueId) {
      return calPathParser.parseCalendarPath(uniqueId);
    }

    /**
     * Get the owner of the calendar
     * @returns {user} return the owner of the calendar
     */
    function getOwner() {
      if (this.isResource()) {
        return calResourceService.getResource(this.rights.getResourceId());
      }

      var ownerId = this.rights.getOwnerId();

      return ownerId && calendarUsersCache.getUser(ownerId);
    }

    /**
     * Get the type of the calendar
     * @returns {string} return the type of the calendar
     */
    function getCalendarType() {
      return this.type;
    }

    function getResourceId() {
      return this.rights.getResourceId();
    }

    /**
     * Return an instance of CalendarCollectionShell
     * @returns {CalendarCollectionShell} return CalendarCollectionShell
     */
    function getCalendarCollectionShell(calendar) {
      if (calendar instanceof CalendarCollectionShell) {
        return calendar;
      }

      return new CalendarCollectionShell(calendar);
    }

    /**
     * Check if the userId can perform admin task on this calendar
     * @param userId
     * @returns {boolean} return true if userId has admin right on this calendar
     */
    function isAdmin(userId) {
      return this.isOwner(userId) || this.rights.getShareeRight(userId) === CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN;
    }

    /**
     * Check if the user is the owner of the calendar
     * @returns {boolean} return true if the user is the owner of the calendar
     */
    function isOwner(userId) {
      return userId === this.rights.getOwnerId();
    }

    /**
     * Check if this calendar is public
     * @returns {boolean} return true if the calendar is public
     */
    function isPublic() {
      return !!this.rights.getPublicRight();
    }

    /**
     * Check if it's a resource calendar
     * @returns {boolean} return true if the calendar is from a resource
     */
    function isResource() {
      return this.type && this.type.toLowerCase() === CAL_CALENDAR_TYPE.RESOURCE;
    }

    /**
     * Check if this calendar is a subscription
     * @returns {boolean} return true if the calendar is has a source property
     */
    function isSubscription() {
      return !!this.source;
    }

    /**
     * Check if this calendar has been shared by another user
     * @returns {boolean} return true if the calendar has a delegated source property
     */
    function isDelegated() {
      return !!this.delegatedsource;
    }

    /**
     * Get the uniqueId of the calendar
     * @returns {String} return the source uniqueId for subscriptions, otherwise it returns the calendar uniqueId
     */
    function getUniqueId() {
      return this.isSubscription() ? this.source.uniqueId : this.uniqueId;
    }

    /**
     * Check if user has read rights on this calendar
     * @param userId
     * @returns {boolean} return true if the calendar is public
     */
    function isReadable(userId) {
      return this.isWritable(userId) ||
        this.rights.getShareeRight(userId) === CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ ||
        this.rights.getPublicRight() === CAL_CALENDAR_PUBLIC_RIGHT.READ;
    }

    /**
     * Check if this calendar has been shared by another user
     * Note: if userId is the calendar owner, it doesn't have sharee right, so isShared will return false.
     * @param userId
     * @returns {boolean} return true if userId has sharee right on this calendar
     */
    function isShared(userId) {
      return !!this.rights.getShareeRight(userId);
    }

    /**
     * Check if user has write rights on this calendar
     * @param userId
     * @returns {boolean} return true if the calendar is public
     */
    function isWritable(userId) {
      return this.isAdmin(userId) ||
        this.rights.getShareeRight(userId) === CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE ||
        this.rights.getPublicRight() === CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE;
    }

    function isOldDefaultCalendar() {
      return this.id === CAL_OLD_DEFAULT_ID;
    }
  }
})();
