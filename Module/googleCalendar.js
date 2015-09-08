var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

GoogleCalendar = function() {
}

/**
 * Create an OAuth2 client with the given credentials.
 *
 * @param {Object} credentials The authorization client credentials.
 */
GoogleCalendar.prototype.oauth = function (credentials) {
  this.clientSecret = credentials.client_secret;
  this.clientId = credentials.client_id;
  this.redirectUrl = credentials.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(this.clientId, this.clientSecret, this.redirectUrl);
  return oauth2Client;
}

/**
 * Generate a new authentication URL.
 *
 * @param {google.auth.OAuth2} oauth2Client An authorized OAuth2 client.
 * @param {callback} callback Callback function
 */
GoogleCalendar.prototype.getAuthUrl = function (oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  callback(null, authUrl);
}

/**
 * Generate a token using the OAuth Client and authorization code.
 *
 * @param {google.auth.OAuth2} oauth2Client An authorized OAuth2 client.
 * @param {String} code Authorization code
 * @param {callback} callback Callback function
 */
GoogleCalendar.prototype.generateToken = function (oauth2Client, code, callback) {
  oauth2Client.getToken(code, function(err, token) {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
    callback(null, token);
  });
}

/**
 * Lists the last 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} oauth2Client An authorized OAuth2 client.
 * @param {callback} callback Callback function
 */
GoogleCalendar.prototype.getEvents = function (auth, callback) {
  var eventData;
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      callback(err, null);
      return;
    }
    var events = response.items;
    callback(null, events);
  });
}

/**
 * Get specific event information by event ID.
 *
 * @param {google.auth.OAuth2} oauth2Client An authorized OAuth2 client.
 * @param {string} eventID Event ID to get the data for.
 * @param {callback} callback Callback function
 */
GoogleCalendar.prototype.getEventByID = function (auth, eventID, callback) {
  var calendar = google.calendar('v3');
  calendar.events.get({
    auth: auth,
    calendarId: 'primary',
    eventId: eventID,
  }, function(err, response) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, response);
  });
}

module.exports = GoogleCalendar;