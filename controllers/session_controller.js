var ClientModel = require('../models/client_model').ClientModel;

// Someone tries to login
exports.login = function(io, socket, data) {
	// No nickname? Sorry
	if (!data.nickname) {
		socket.emit('error', {
			message: 'no nickname provided'
		});
		return;
	}

	// Seach for duplicate nicknames
	ClientModel.findOne({
		nickname: data.nickname
	}, function(err, doc) {
		// Oops...
		if (err) {
			socket.emit('error', {
				message: 'error reading clients list'
			});
			return;
		}

		// Duplicated nickname :(
		if (doc) {
			console.warn('nickname in use, orphan records?', doc.nickname);

			socket.emit('login error', {
				message: 'nickname in use'
			});
			return;
		}

		// So far, so good! Save new client for future references
		var client = new ClientModel();

		client.nickname = data.nickname;
		client.socket_id = socket.id;

		client.save(function() {
			// And inform the client :)
			socket.emit('login ok', {
				nickname: data.nickname
			});

			// And finally, broadcas a clients update
			exports.clients(io, socket);
		});
	});
}

// Someone is manually login out
exports.logout = function(io, socket, data) {
	// Reuse ;) disconnect
	exports.disconnect(io, socket, data);
}

// Broadcast clients to the world
exports.clients = function(io, socket, data) {
	ClientModel.find({}, function(err, data) {
		io.sockets.emit('clients', {
			clients: data
		});
	});
}

// Oops, disconnected!
exports.disconnect = function(io, socket, data) {
	// Who was she?
	ClientModel.findOne({
		socket_id: socket.id
	}, function(err, doc) {
		// Oops...
		if (err) {
			socket.emit('error', {
				message: 'error reading clients list'
			});
			return;
		}

		// OMG! A ghost!
		if (!doc) {
			socket.emit('logout error', {
				message: 'client not found'
			});
			return;
		}

		// Remove the client from DB to release the nickname
		doc.remove(function() {
			socket.emit('logout ok');
		});

		// Broadcast current clients
		exports.clients(io, socket);
	});
}
