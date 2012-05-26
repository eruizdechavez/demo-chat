/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes');

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

// Configuration
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});

// Routes
// Sockets
var clients = [], messages = [];

io.sockets.on('connection', function(socket) {
	socket.on('login attempt', function(data) {
		if (!data.nickname) {
			socket.emit('error', {
				message: 'no nickname provided'
			});
			return;
		}

		if (clients.indexOf(data.nickname) >= 0) {
			socket.emit('login error', {
				message: 'nickname already in use'
			});
			return;
		}

		socket.set('nickname', data.nickname, function() {
			console.log('client connection', data.nickname);
			clients.push(data.nickname);
			console.log(clients);
			socket.emit('login ok', {
				nickname: data.nickname,
				clients: clients
			});
		});
	});

	socket.on('logout attempt', function(data) {
		if (!data.nickname) {
			socket.emit('error', {
				message: 'no nickname provided'
			});
			return;
		}

		if (clients.indexOf(data.nickname) < 0) {
			socket.emit('logout error', {
				message: 'nickname not found'
			});
			return;
		}

		socket.set('nickname', null, function() {
			console.log('client disconnect', data.nickname);
			clients.splice(clients.indexOf(data.nickname), 1);
			console.log(clients);
			socket.emit('logout ok');
		});
	});

	socket.on('message', function(data) {
		if (!data.message) {
			socket.emit('error', {
				message: 'no message provided'
			});
			return;
		}

		socket.get('nickname', function(err, nickname) {
			var message = {nickname: nickname, message: data.message}
			messages.push(message);
			io.sockets.emit('message', message);
		});
	});

	socket.on('disconnect', function(data) {
		socket.get('nickname', function(err, nickname) {
			if (err) {
				console.error('error on client disconnect');
				return;
			}

			console.log('client disconnect', nickname);
			clients.splice(clients.indexOf(nickname), 1);
			console.log(clients);

			io.sockets.emit('client disconnect', {
				nickname: nickname
			});
		});
	});
});

// Applications
app.listen(3000, function() {
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
