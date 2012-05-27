var ClientModel = require('../models/client_model').ClientModel;

// Receive and broadcast messages
exports.message = function(io, socket, data) {
	// No message, no fun
	if (!data.message) {
		socket.emit('error', {
			message: 'no message provided'
		});
		return;
	}

	// Find client broadcasting the message
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

		// Who is she?
		if (!doc) {
			socket.emit('message error', {
				message: 'client not found'
			});
			return;
		}

		// Prepare message
		var message = {
			nickname: doc.nickname,
			message: data.message
		}

		// Broadcast to the world
		io.sockets.emit('message', message);
	});
}
