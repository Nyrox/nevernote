"use strict";

/*
Makes an API call to the server backend.
If body_data is defined, its assumed to be either a JSON string or an Object.
In the latter case it will be run through JSON.parse before being sent.
In both cases the Content-Type header will be set to application/json
The callback will be passed (status, responseText) as parameters.
This call is always asynchronous.
*/

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function api_call(method, endpoint, body_data, cb) {
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function () {
		if (this.readyState == 4) {
			cb(this.status, this.responseText);
		}
	};

	xhttp.open(method, endpoint, true);

	var data = body_data;
	if ((typeof data === "undefined" ? "undefined" : _typeof(data)) == "object") data = JSON.stringify(data);
	if (typeof data == "string") xhttp.setRequestHeader("Content-Type", "application/json");

	xhttp.send(data);
}

var Profile = function (_React$Component) {
	_inherits(Profile, _React$Component);

	function Profile(props) {
		_classCallCheck(this, Profile);

		var _this = _possibleConstructorReturn(this, (Profile.__proto__ || Object.getPrototypeOf(Profile)).call(this, props));

		_this.state = { user_info: {} };

		if (app.state.user_id == 0) {
			console.error("Profile instantiated without a valid user_id.");
		}

		var self = _this;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				var response = JSON.parse(this.responseText);
				self.setState({ "user_info": JSON.parse(this.responseText) });
			}
		};
		xhttp.open("GET", "/api/user/" + app.state.user_id, true);
		xhttp.send();
		return _this;
	}

	_createClass(Profile, [{
		key: "render",
		value: function render() {
			return React.createElement(
				"div",
				{ className: "profile" },
				React.createElement(
					"p",
					{ style: { fontSize: "10px" } },
					"Logged in:"
				),
				React.createElement(
					"h2",
					null,
					this.state.user_info.login
				),
				React.createElement(
					"button",
					{ onClick: function onClick() {
							app.logout();
						} },
					"Logout"
				)
			);
		}
	}]);

	return Profile;
}(React.Component);

var LoginStatus = function (_React$Component2) {
	_inherits(LoginStatus, _React$Component2);

	function LoginStatus() {
		_classCallCheck(this, LoginStatus);

		return _possibleConstructorReturn(this, (LoginStatus.__proto__ || Object.getPrototypeOf(LoginStatus)).apply(this, arguments));
	}

	_createClass(LoginStatus, [{
		key: "render",
		value: function render() {
			if (app.state.session_token) {
				return React.createElement(
					"div",
					{ className: "login-status" },
					React.createElement(Profile, null)
				);
			} else {
				return React.createElement(
					"div",
					{ className: "login-status" },
					React.createElement(
						"button",
						{ onClick: function onClick() {
								app.setState({ "login_layer": "login" });
							} },
						"Sign in"
					),
					React.createElement(
						"button",
						{ onClick: function onClick() {
								app.setState({ "login_layer": "register" });
							} },
						"Sign up"
					)
				);
			}
		}
	}]);

	return LoginStatus;
}(React.Component);

var FullscreenLayer = function (_React$Component3) {
	_inherits(FullscreenLayer, _React$Component3);

	function FullscreenLayer(props) {
		_classCallCheck(this, FullscreenLayer);

		var _this3 = _possibleConstructorReturn(this, (FullscreenLayer.__proto__ || Object.getPrototypeOf(FullscreenLayer)).call(this, props));

		_this3.handleClick = _this3.handleClick.bind(_this3);
		return _this3;
	}

	_createClass(FullscreenLayer, [{
		key: "handleClick",
		value: function handleClick(event) {
			if (event.target.classList.contains("layer-fullscreen")) {
				this.props.onClose();
			}
		}
	}, {
		key: "render",
		value: function render() {
			return React.createElement(
				"div",
				{ className: "layer-fullscreen", onClick: this.handleClick },
				React.createElement(
					"div",
					{ className: "layer-inner" },
					this.props.children
				)
			);
		}
	}]);

	return FullscreenLayer;
}(React.Component);

var RegisterForm = function (_React$Component4) {
	_inherits(RegisterForm, _React$Component4);

	function RegisterForm(props) {
		_classCallCheck(this, RegisterForm);

		var _this4 = _possibleConstructorReturn(this, (RegisterForm.__proto__ || Object.getPrototypeOf(RegisterForm)).call(this, props));

		_this4.state = { login: "", password: "", email: "" };

		_this4.handleSubmit = _this4.handleSubmit.bind(_this4);
		_this4.handleChange = _this4.handleChange.bind(_this4);
		return _this4;
	}

	_createClass(RegisterForm, [{
		key: "handleSubmit",
		value: function handleSubmit(event) {
			event.preventDefault();

			api_call("POST", "/api/auth/register", { login: this.state.login, password: this.state.password, email: this.state.email }, function (status, response) {
				console.log(typeof response === "undefined" ? "undefined" : _typeof(response));
				if (status == 200) {
					var response_data = JSON.parse(response);
					app.setState({ user_id: response_data.user_id });
					app.updateSessionCookieInternal();
				} else {
					console.log(status, response);
				}
			});
		}
	}, {
		key: "handleChange",
		value: function handleChange(event) {
			var _state = _defineProperty({}, event.target.name, event.target.value);
			//state[event.target.name] = event.target.value;
			this.setState(_state);
		}
	}, {
		key: "render",
		value: function render() {
			return React.createElement(
				"form",
				{ className: "form-login", onSubmit: this.handleSubmit },
				React.createElement("input", { name: "email", placeholder: "E-Mail", value: this.state.email, onChange: this.handleChange }),
				React.createElement("input", { name: "login", placeholder: "Login", value: this.state.login, onChange: this.handleChange }),
				React.createElement("input", { name: "password", placeholder: "Password", value: this.state.password, onChange: this.handleChange, type: "password" }),
				React.createElement("input", { type: "submit", value: "Register" })
			);
		}
	}]);

	return RegisterForm;
}(React.Component);

var LoginForm = function (_React$Component5) {
	_inherits(LoginForm, _React$Component5);

	function LoginForm(props) {
		_classCallCheck(this, LoginForm);

		var _this5 = _possibleConstructorReturn(this, (LoginForm.__proto__ || Object.getPrototypeOf(LoginForm)).call(this, props));

		_this5.state = { login: "", password: "" };

		_this5.handleSubmit = _this5.handleSubmit.bind(_this5);
		_this5.handleChange = _this5.handleChange.bind(_this5);
		return _this5;
	}

	_createClass(LoginForm, [{
		key: "handleSubmit",
		value: function handleSubmit(event) {
			event.preventDefault();

			api_call("POST", "/api/auth/login", { login: this.state.login, password: this.state.password }, function (status, response) {
				if (status == 200) {
					var response_data = JSON.parse(response);
					app.setState({ user_id: response_data.user_id });
					app.updateSessionCookieInternal();
				} else {
					console.log(status, response);
				}
			});
		}
	}, {
		key: "handleChange",
		value: function handleChange(event) {
			var _state = _defineProperty({}, event.target.name, event.target.value);
			//state[event.target.name] = event.target.value;
			this.setState(_state);
		}
	}, {
		key: "render",
		value: function render() {
			return React.createElement(
				"form",
				{ className: "form-login", onSubmit: this.handleSubmit },
				React.createElement("input", { name: "login", placeholder: "Login/E-Mail", value: this.state.login, onChange: this.handleChange }),
				React.createElement("input", { name: "password", placeholder: "Password", value: this.state.password, onChange: this.handleChange, type: "password" }),
				React.createElement("input", { type: "submit", value: "Login" })
			);
		}
	}]);

	return LoginForm;
}(React.Component);

var Header = function (_React$Component6) {
	_inherits(Header, _React$Component6);

	function Header() {
		_classCallCheck(this, Header);

		return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
	}

	_createClass(Header, [{
		key: "render",
		value: function render() {
			return React.createElement(
				"div",
				{ className: "header" },
				React.createElement(
					"h1",
					null,
					"AE Software"
				),
				React.createElement(
					"button",
					{ style: { marginRight: "auto", marginLeft: "48px" }, onClick: function onClick() {
							return editor.updateContent(0, "New draft", "I like chickens!");
						} },
					"New draft"
				),
				React.createElement(LoginStatus, null)
			);
		}
	}]);

	return Header;
}(React.Component);

var LeftSidebar = function (_React$Component7) {
	_inherits(LeftSidebar, _React$Component7);

	function LeftSidebar(props) {
		_classCallCheck(this, LeftSidebar);

		var _this7 = _possibleConstructorReturn(this, (LeftSidebar.__proto__ || Object.getPrototypeOf(LeftSidebar)).call(this, props));

		window.sidebar = _this7;
		_this7.state = { tiles: [] };
		_this7.updateNoteList();
		return _this7;
	}

	_createClass(LeftSidebar, [{
		key: "updateNoteList",
		value: function updateNoteList() {
			api_call("GET", "api/note/get/user/" + app.state.user_id, null, function (status, response_text) {
				if (status != 200) {
					console.log(status, response_text);return;
				}

				var response = JSON.parse(response_text);
				this.state.tiles = response;
				this.forceUpdate();
			}.bind(this));
		}
	}, {
		key: "render",
		value: function render() {
			var _this8 = this;

			return React.createElement(
				"div",
				{ className: "sidebar-left" },
				React.createElement(
					"ul",
					{ className: "note-list" },
					this.state.tiles.map(function (tile, index) {
						console.log(tile);
						return React.createElement(
							"li",
							{ onClick: function onClick() {
									return _this8.onTileClicked(index);
								}, key: tile.id },
							tile.title
						);
					})
				)
			);
		}
	}]);

	return LeftSidebar;
}(React.Component);

var Editor = function (_React$Component8) {
	_inherits(Editor, _React$Component8);

	function Editor(props) {
		_classCallCheck(this, Editor);

		var _this9 = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

		window.editor = _this9;

		_this9.state = {
			id: 0,
			title: "Untitled Draft"
		};

		_this9.onChange = _this9.onChange.bind(_this9);
		_this9.save = _this9.save.bind(_this9);
		_this9.delete = _this9.delete.bind(_this9);
		return _this9;
	}

	_createClass(Editor, [{
		key: "updateContent",
		value: function updateContent(id, title, content) {
			this.setState({ id: id, title: title });
			this.state.flask_editor.updateCode(content);
			this.state.flask_editor.updateLineNumbersCount();
		}
	}, {
		key: "componentDidMount",
		value: function componentDidMount() {
			CodeFlask.prototype.closeCharacter = function () {/* CodeFlask's default behaviour for this is just awful */};

			this.state.flask_editor = new CodeFlask(".editor", {
				language: "none",
				lineNumbers: true,
				tabSize: 4
			});

			window.flask = this.state.flask_editor;
		}
	}, {
		key: "render",
		value: function render() {
			return React.createElement(
				"div",
				{ className: "editor-container" },
				React.createElement(
					"div",
					{ className: "toolbar" },
					React.createElement("input", { className: "note-title", onChange: this.onChange, value: this.state.title, name: "title" }),
					React.createElement(
						"div",
						{ className: "button-group" },
						this.state.id != 0 && React.createElement(
							"button",
							{ className: "btn-delete", style: { marginRight: "16px" }, onClick: this.delete },
							"Delete"
						),
						React.createElement(
							"button",
							{ onClick: this.save.bind(this) },
							"Save"
						)
					)
				),
				React.createElement("div", { className: "codeflask editor" })
			);
		}
	}, {
		key: "onChange",
		value: function onChange(event) {
			var _state = _defineProperty({}, event.target.name, event.target.value);
			this.setState(_state);
		}
	}, {
		key: "save",
		value: function save() {
			if (this.state.id == 0) {
				api_call("POST", "/api/note/create", { title: this.state.title, content: this.state.flask_editor.getCode() }, function (status, response) {
					this.setState({ id: JSON.parse(response).id });
					sidebar.updateNoteList();
				}.bind(this));
			} else {
				api_call("POST", "/api/note/save", { id: this.state.id, title: this.state.title, content: this.state.flask_editor.getCode() }, function (status, response) {
					sidebar.updateNoteList();
				});
			}
		}
	}, {
		key: "delete",
		value: function _delete() {
			if (!window.confirm("Are you sure you want to delet this note?")) return;

			api_call("POST", "/api/note/delete/" + this.state.id, null, function (status, responseText) {
				this.updateContent(0, "New draft", "I like chickens!");
				sidebar.updateNoteList();
			}.bind(this));
		}
	}]);

	return Editor;
}(React.Component);

var Application = function (_React$Component9) {
	_inherits(Application, _React$Component9);

	_createClass(Application, [{
		key: "getCookieValue",
		value: function getCookieValue(a) {
			var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
			return b ? b.pop() : '';
		}
	}, {
		key: "updateSessionCookieInternal",
		value: function updateSessionCookieInternal() {
			var session_token = this.getCookieValue("NN-X-Session-Token");
			if (session_token != "") {
				this.setState({ session_token: session_token });
			}
		}
	}, {
		key: "logout",
		value: function logout() {
			api_call("GET", "/logout", null, function (status, responseText) {
				if (status !== 200) {
					console.error(status, responseText);
				}

				this.setState({
					session_token: undefined,
					user_id: undefined
				});
			}.bind(this));
		}
	}]);

	function Application() {
		_classCallCheck(this, Application);

		var _this10 = _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).call(this));

		window.app = _this10;
		_this10.state = { login_layer: undefined, user_id: 0, session_token: undefined };

		// Grab the session cookie if we have one
		var session_token = _this10.getCookieValue("NN-X-Session-Token");
		if (session_token != "") {
			_this10.state.session_token = session_token;
			_this10.state.user_id = parseInt(sessionStorage.getItem("user_id"));
		}
		return _this10;
	}

	_createClass(Application, [{
		key: "render",
		value: function render() {
			sessionStorage.setItem("user_id", this.state.user_id);

			return React.createElement(
				React.Fragment,
				null,
				React.createElement(Header, null),
				React.createElement(
					"div",
					{ className: "main-area" },
					app.state.session_token != undefined ? React.createElement(
						React.Fragment,
						null,
						React.createElement(LeftSidebar, null),
						React.createElement(Editor, null)
					) : React.createElement(
						React.Fragment,
						null,
						React.createElement("img", { src: "/public/img/background.jpg" }),
						React.createElement(
							"div",
							{ className: "teaser" },
							React.createElement(
								"h1",
								null,
								"Generic enterprise solutions for your trivial problems"
							),
							React.createElement(
								"h2",
								null,
								"Register now to get the full benefit of absolutely overengineered software!"
							)
						)
					)
				),
				app.state.session_token == undefined && app.state.login_layer != undefined && React.createElement(
					FullscreenLayer,
					{ onClose: function onClose() {
							app.setState({ login_layer: undefined });
						} },
					app.state.login_layer == "login" ? React.createElement(LoginForm, null) : React.createElement(RegisterForm, null)
				)
			);
		}
	}]);

	return Application;
}(React.Component);

ReactDOM.render(React.createElement(Application, null), document.getElementById("react-container"));