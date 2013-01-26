var mongoose = require('mongoose');

exports.MessageSchema = new mongoose.Schema({
	_id: mongoose.Schema.ObjectId,
	nickname: '',
	message: '',
	timestamp: ''
});

exports.MessageModel = mongoose.model('messages', exports.MessageSchema);
