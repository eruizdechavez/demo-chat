var express = require('express'),
	app = module.exports = express.createServer(),
	io = require('socket.io').listen(app),
	mongoose = require('mongoose'),
	session = require('./controllers/session_controller'),
	message = require('./controllers/message_controller');

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.use(express.static(__dirname + '/public'));
});

mongoose.connect('mongodb://localhost/demo-chat');

app.listen(3000, function() {
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

io.sockets.on('connection', function(socket) {

	socket.on('login attempt', function(data) {
		session.login(io, socket, data);
	});

	socket.on('logout attempt', function(data) {
		session.logout(io, socket, data);
	});

	socket.on('message', function(data) {
		message.message(io, socket, data);
	});

	socket.on('disconnect', function(data) {
		session.disconnect(io, socket, data);
	});
});
