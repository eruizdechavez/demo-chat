var ClientModel = require('../models/client_model').ClientModel;

exports.login = function(io, socket, data) {
	if (!data.nickname) {
		socket.emit('error', {
			message: 'no nickname provided'
		});
		return;
	}

	ClientModel.findOne({
		nickname: data.nickname
	}, function(err, doc) {
		if (err) {
			socket.emit('error', {
				message: 'error reading clients list'
			});
			return;
		}

		if (doc) {
			socket.emit('login error', {
				message: 'nickname in use'
			});
			return;
		}

		var client = new ClientModel();

		client.nickname = data.nickname;
		client.socket_id = socket.id;

		client.save(function() {
			socket.emit('login ok', {
				nickname: data.nickname
			});

			exports.contacts(io, socket);
		});
	});
}

exports.logout = function(io, socket, data) {
	exports.disconnect(io, socket, data);
}

exports.contacts = function(io, socket, data) {
	ClientModel.find({}, function(err, data) {
		io.sockets.emit('clients', {
			clients: data
		});
	});
}

exports.disconnect = function(io, socket, data) {
	ClientModel.findOne({
		socket_id: socket.id
	}, function(err, doc) {
		if (err) {
			socket.emit('error', {
				message: 'error reading clients list'
			});
			return;
		}

		if (!doc) {
			socket.emit('logout error', {
				message: 'client not found'
			});
			return;
		}

		doc.remove(function() {
			socket.emit('logout ok');
		});

		exports.contacts(io, socket);
	});
}
