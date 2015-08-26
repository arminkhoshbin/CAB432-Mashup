//express is a light weight web framework similar to sinatra (ruby), and Nancy (.net)
//read more about express at: http://expressjs.com/
var express = require('express');
var secret = require('./config/config').GoogleCalendar;

var GoogleCalendar = require('./Module/googleCalendar');

var app = express();

var GoogleCalendarOAuthClient = GoogleCalendar.init(secret);

app.get('/', function(req, res) {
	/* Add some session handling here for google authorization you glob! */
	if (typeof GoogleCalendarOAuthClient.credentials.access_token != 'undefined') {
		res.send("We have a token! \n" + GoogleCalendarOAuthClient.credentials.access_token);
	}
	else { res.redirect('/login'); }
});

app.get('/login', function(req, res) {
	if (req.query.hasOwnProperty('code')) {
		GoogleCalendar.generateToken(GoogleCalendarOAuthClient, req.query.code, function(err, data) {
			var token = data;
			GoogleCalendarOAuthClient.credentials = token;
			res.redirect('/');
		});
	}
	else {
		// Authorize the app to use Google Calendar.
		var authUrl = GoogleCalendar.getAuthUrl(GoogleCalendarOAuthClient);
		//console.log(authUrl);
		res.redirect(authUrl);
	}
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});