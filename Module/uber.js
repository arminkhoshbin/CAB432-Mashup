var Uber = require('node-uber');

UberAPI = function() {
}

/**
 * Create an Uber OAuth2 client with the given credentials.
 *
 * @param {Object} credentials The authorization client credentials.
 */
UberAPI.prototype.init = function(credentials) {
	this.clientId = credentials.client_id;
	this.clientSecret = credentials.client_secret;
	this.serverToken = credentials.server_token;
  this.redirectUrl = credentials.redirect_uri;
  var uber = new Uber({
	  client_id: this.clientId,
	  client_secret: this.clientSecret,
	  server_token: this.serverToken,
	  redirect_uri: this.redirectUrl,
	  name: 'EventApp'
	});
	return uber;
}

module.exports = UberAPI;