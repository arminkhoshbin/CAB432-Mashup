//express is a light weight web framework similar to sinatra (ruby), and Nancy (.net)
//read more about express at: http://expressjs.com/
var express = require('express');
var secret = require('./config/config');
var session = require('express-session');
var async = require('async');


// Google Maps GeoCoding API initialization
var geocoderProvider = 'google';
var httpAdapter = 'http';
// optionnal
var extra = {
};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter. extra);

// Google Calendar API initialization
var GoogleCalendar = require('./Module/googleCalendar');
var GoogleCalendarAPI = new GoogleCalendar();
var GoogleCalendarOAuthClient = GoogleCalendarAPI.oauth(secret.GoogleCalendar);

// Forecast.io API initialization
var Forecast = require('./Module/forecast');
var ForecastAPI = new Forecast(secret.Forecastio.api_key);

// Uber API initialization
var UberAPI = require('./Module/uber');
var Uber = new UberAPI();
var uber = Uber.init(secret.Uber);

var app = express();

// Session configuarion
app.use(session({ 
	secret: secret.GoogleCalendar.client_secret, 
	resave: false,
	saveUninitialized: true,
	// valid for 1 hour
	cookie: { maxAge: 3600000 },
}));

// Setting up the template engine
app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.set('views', __dirname + '/views');

// All the public files (client side files)
app.use('/public', express.static('public'));

// Handles Authentication to endpoints
function requireAuthentication(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', requireAuthentication, function(req, res) {
	res.render('index');
});

// uber services available around a specific location.
app.get('/uber/services', requireAuthentication, function(req, res) {
	var address = req.query.address;
	var endLat = req.query.endLat;
	var endLong = req.query.endLong;
	var addressLocation = {};
	var result = {};

	async.series([
		function(callback) {
			geocoder.geocode(address + ' Brisbane', function(err, data) {
				addressLocation = data[0];
				callback();
			});
		},
		function(callback) {
			uber.estimates.price({ 
			  start_latitude: addressLocation.latitude, start_longitude: addressLocation.longitude, 
			  end_latitude: endLat, end_longitude: endLong 
			}, function (err, data) {
			  if (err) console.error(err);
			  result = data;
			  callback();
			});
		},
		], function(err) { 
        if (err) return next(err);
        res.send(result);
  });

});

// Handles Google Authentication and setting session
app.get('/login', function(req, res) {
	if (req.query.hasOwnProperty('code')) {
		GoogleCalendarAPI.generateToken(GoogleCalendarOAuthClient, req.query.code, function(err, data) {
			var token = data;
			GoogleCalendarOAuthClient.credentials = token;
			req.session.loggedIn = true;
			res.redirect('/');
		});
	}
	else {
		// Authorize the app to use Google Calendar.
		GoogleCalendarAPI.getAuthUrl(GoogleCalendarOAuthClient, function(err, data) {
			var authUrl = data;
			res.redirect(authUrl);
		});
	}
});

// Log out of dashboard and destroy the session.
app.get('/logout', requireAuthentication, function(req, res) {
	req.session.destroy(function(err) {
  	if (err) { res.send(err); }
  	else { res.redirect('/'); }
	});
});

// get last 10 events in your calendar.
app.get('/events', requireAuthentication, function(req, res) {
	GoogleCalendarAPI.getEvents(GoogleCalendarOAuthClient, function(err, data) {
		res.send(data);
	});
});

// More detail about events including the weather forecast of the day.
app.get('/event/:id', requireAuthentication, function(req, res) {
	var eventDetail = {};
	var eventLocation = {};
	var weatherForecast = {};
	async.series([
		function(callback) {
			GoogleCalendarAPI.getEventByID(GoogleCalendarOAuthClient, req.params.id, function(err, data) {
				eventDetail = data;
				callback();
			});
		},
		function(callback) {
			geocoder.geocode(eventDetail.location + ' Brisbane', function(err, data) {
				eventLocation = data[0];
				callback();
			});
		},
		function(callback) {
			ForecastAPI.getForecastByDate(eventLocation.latitude, eventLocation.longitude, eventDetail.start.dateTime, function(err, data) {
				weatherForecast = JSON.parse(data).daily;
				callback();
			});
		},
		], function(err) { 
        if (err) return next(err);
        res.render('event', {'eventDetail': eventDetail, 'eventLocation': eventLocation, 'Weather': weatherForecast});
  });
});

// This end point is for test purposes only
app.get('/session/set', function(req, res) {
	req.session.loggedIn = true;
});

// Starting the server
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://localhost:3000');
});

module.exports = app;