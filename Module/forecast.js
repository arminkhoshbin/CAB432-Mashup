var request = require('request');

var uri;

/**
 * Setting the URL that the weather requests will be sent to.
 *
 * @param {string} api_key Forecast.io api key.
 */
Forecast = function(api_key) {
	this.uri = "https://api.forecast.io/forecast/" + api_key + '/';
}

/**
 * Get Weather data for a particular Lat, Long and at a certain date.
 *
 * @param {number} lat Latitude for weather forecast.
 * @param {number} long Longitude for weather forecast.
 * @param {string} date Date for weather forecast.
 * @param {callback} callback Callback function.
 */
Forecast.prototype.getForecastByDate = function(lat, long, date, callback) {
	var url = this.uri + lat + ',' + long + ',' + date + '?units=si';
	request(url, function(err, res, data) {
		if (err) {
			callback(err, null);
			return;
		}
		callback(null, data);
	});
}

module.exports = Forecast;