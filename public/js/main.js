var socket = io.connect('http://' + window.location.hostname + ':' + window.location.port);

var LoginView = Backbone.View.extend({
	el: '#login',
	nickname: '',

	events: {
		'click .btn.login': 'login',
		'click .btn.logout': 'logout'
	},

	initialize: function() {
		_.bindAll(this);
		socket.on('login ok', this.loginOk);
		socket.on('login error', this.loginError);
		socket.on('logout ok', this.logoutOk);
	},

	login: function() {
		this.nickname = this.$('#nickname').val() || 'johndoe' + parseInt(Math.random() * 10);
		socket.emit('login attempt', {
			nickname: this.nickname
		});
		return false;
	},

	loginOk: function(data) {
		this.$('.login-form').hide();
		this.$('.logout-form').show();
		this.$('.nickname-display').text(data.nickname);
	},

	logout: function() {
		socket.emit('logout attempt', {
			nickname: this.nickname
		});
		return false;
	},

	logoutOk: function(data) {
		this.$('.logout-form').hide();
		this.$('.login-form').show();
	}
});

var ChatView = Backbone.View.extend({
	el: '#chat',

	events: {
		'keyup #message': 'send'
	},

	initialize: function() {
		_.bindAll(this);
		socket.on('login ok', this.loginOk);
		socket.on('logout ok', this.logoutOk);
		socket.on('message', this.message);
	},

	send: function(event) {
		if (event.keyCode === 13) {
			var message = $('#message').val();
			socket.emit('message', {message: message});
			$('#message').val('');
		}
	},


	loginOk: function() {
		this.$el.show();
	},

	logoutOk: function() {
		this.$('#log').val('');
		this.$el.hide();
	},

	message: function(data) {
		var text = this.$('#log').text();

		this.$('#log').text(text + '\n' + data.nickname + ' : ' + data.message);
	}
});

var login = new LoginView();
var chat = new ChatView();
