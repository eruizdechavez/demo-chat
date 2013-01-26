// Code dependencies
var express = require('express');
var app = express.createServer();
var server = app.listen(3000);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose'),
	session = require('./controllers/session_controller'),
	message = require('./controllers/message_controller'),
	ClientModel = require('./models/client_model').ClientModel;

var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

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
console.log("Express server listening on port %d in %s mode".verbose, 3000, app.settings.env);

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
