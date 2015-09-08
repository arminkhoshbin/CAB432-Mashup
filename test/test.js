var should  = require('should');
var request = require('supertest');
var superagent = require('superagent');
var app     = require('../server');
var agent = superagent.agent();

var Session = require('supertest-session')({
  app: app,
  before: function (req) {
    req.set('loggedIn', true);
  }
});

describe('Logging In', function() {
	it('- Redirects to login page', function(done) {
		request(app)
	    .get('/events')
	    .end(function (err, res) {
	    	if(err) done(err);
	      res.headers['location'].should.equal('/login');
	      done();
	    });
  });

  it('- Redirects to google authentication page', function(done) {
		request(app)
	    .get('/login')
	    .end(function (err, res) {
	    	if(err) done(err);
	      res.headers['location'].should.containEql('https://accounts.google.com');
	      done();
	    });
  });

});

describe('Logging Out', function() {
	it('- Destoying the session and redirecting to login page', function(done) {
		request(app)
	    .get('/logout')
	    .end(function (err, res) {
	    	if(err) done(err);
	      res.headers['location'].should.equal('/login');
	      done();
	    });
  });

});