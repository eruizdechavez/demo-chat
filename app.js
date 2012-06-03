// Code dependencies
var express = require('express'),
	app = module.exports = express.createServer(),
	io = require('socket.io').listen(app),
	mongoose = require('mongoose'),
	session = require('./controllers/session_controller'),
	message = require('./controllers/message_controller'),
	ClientModel = require('./models/client_model').ClientModel;

// Basic express server, only for static content
app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});

// DB Connection for Client list
mongoose.connect('mongodb://localhost/demo-chat');

// Clean previous data
var clients = new ClientModel();
clients.collection.drop();

// Start Express
app.listen(3000, function() {
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// Add listeners to the sockets
io.sockets.on('connection', function(socket) {

	// Handle chat logins
	socket.on('login attempt', function(data) {
		session.login(io, socket, data);
	});

	// handle chat logouts
	socket.on('logout attempt', function(data) {
		session.logout(io, socket, data);
	});

	// Handle messages
	socket.on('message', function(data) {
		message.message(io, socket, data);
	});

	// Handle disconnects
	socket.on('disconnect', function(data) {
		session.disconnect(io, socket, data);
	});
});
