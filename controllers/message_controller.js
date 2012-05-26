var ClientModel = require('../models/client_model').ClientModel;

exports.message = function(io, socket, data) {
	if (!data.message) {
		socket.emit('error', {
			message: 'no message provided'
		});
		return;
	}

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
			socket.emit('message error', {
				message: 'client not found'
			});
			return;
		}

		var message = {
			nickname: doc.nickname,
			message: data.message
		}

		io.sockets.emit('message', message);
	});
}
