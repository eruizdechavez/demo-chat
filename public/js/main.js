$(function() {
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

		loginError: function(data) {
			alert(data.message);
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

		scroll: 0,

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
				socket.emit('message', {
					message: message
				});
				$('#message').val('');
			}
		},


		loginOk: function() {
			this.$el.show();
		},

		logoutOk: function() {
			this.$('#log').empty();
			this.$el.hide();
		},

		message: function(data) {
			var log = this.$('#log'),
				nickname = $('<div class="span1 nickname"></div>'),
				message = $('<div class="span8"></div>'),
				row = $('<div class="row"></div>');

			nickname.text(data.nickname);
			message.text(data.message);
			row.append(nickname).append(message);
			log.append(row);

			this.scroll += $(log.children()[log.children().length - 1]).height();

			log.scrollTop(this.scroll);
		}
	});

	var ContactsView = Backbone.View.extend({
		el: '#clients',

		initialize: function() {
			_.bindAll(this);
			socket.on('clients', this.clients);
		},

		clients: function(data) {
			this.$el.empty();

			_.forEach(data.clients, function(item) {
				this.$el.append('<li>' + item.nickname + '</li>');
			}, this);
		}
	});

	var login = new LoginView();
	var chat = new ChatView();
	var contacts = new ContactsView();
});
