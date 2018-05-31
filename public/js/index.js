"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

window.flask_editor = new CodeFlask("#editor", { language: "none" });

var LoginStatus = function (_React$Component) {
	_inherits(LoginStatus, _React$Component);

	function LoginStatus() {
		_classCallCheck(this, LoginStatus);

		return _possibleConstructorReturn(this, (LoginStatus.__proto__ || Object.getPrototypeOf(LoginStatus)).apply(this, arguments));
	}

	_createClass(LoginStatus, [{
		key: "render",
		value: function render() {
			if (app.state.session_token) {
				return React.createElement("div", { className: "login-status" });
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

var FullscreenLayer = function (_React$Component2) {
	_inherits(FullscreenLayer, _React$Component2);

	function FullscreenLayer(props) {
		_classCallCheck(this, FullscreenLayer);

		return _possibleConstructorReturn(this, (FullscreenLayer.__proto__ || Object.getPrototypeOf(FullscreenLayer)).call(this, props));
	}

	_createClass(FullscreenLayer, [{
		key: "render",
		value: function render() {
			return React.createElement(
				"div",
				{ className: "layer-fullscreen" },
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

var LoginForm = function (_React$Component3) {
	_inherits(LoginForm, _React$Component3);

	function LoginForm(props) {
		_classCallCheck(this, LoginForm);

		var _this3 = _possibleConstructorReturn(this, (LoginForm.__proto__ || Object.getPrototypeOf(LoginForm)).call(this, props));

		_this3.state = { login: "", password: "" };

		_this3.handleSubmit = _this3.handleSubmit.bind(_this3);
		_this3.handleChange = _this3.handleChange.bind(_this3);
		return _this3;
	}

	_createClass(LoginForm, [{
		key: "handleSubmit",
		value: function handleSubmit(event) {
			event.preventDefault();

			//
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					var response = JSON.parse(this.responseText);
					console.log(response);
				}
			};
			xhttp.open("POST", "/api/auth/login", true);
			xhttp.setRequestHeader("Content-Type", "application/json");
			xhttp.send(JSON.stringify({ login: this.state.login, password: this.state.password }));
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
				React.createElement("input", { name: "login", value: this.state.login, onChange: this.handleChange }),
				React.createElement("input", { name: "password", value: this.state.password, onChange: this.handleChange, type: "password" }),
				React.createElement("input", { type: "submit", value: "Submit" })
			);
		}
	}]);

	return LoginForm;
}(React.Component);

var Header = function (_React$Component4) {
	_inherits(Header, _React$Component4);

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
				React.createElement(LoginStatus, null)
			);
		}
	}]);

	return Header;
}(React.Component);

var LeftSidebar = function (_React$Component5) {
	_inherits(LeftSidebar, _React$Component5);

	function LeftSidebar() {
		_classCallCheck(this, LeftSidebar);

		return _possibleConstructorReturn(this, (LeftSidebar.__proto__ || Object.getPrototypeOf(LeftSidebar)).apply(this, arguments));
	}

	_createClass(LeftSidebar, [{
		key: "render",
		value: function render() {
			return React.createElement("div", { className: "sidebar-left" });
		}
	}]);

	return LeftSidebar;
}(React.Component);

var MainArea = function (_React$Component6) {
	_inherits(MainArea, _React$Component6);

	function MainArea() {
		_classCallCheck(this, MainArea);

		return _possibleConstructorReturn(this, (MainArea.__proto__ || Object.getPrototypeOf(MainArea)).apply(this, arguments));
	}

	_createClass(MainArea, [{
		key: "render",
		value: function render() {
			return React.createElement("main", { className: "main-area" });
		}
	}]);

	return MainArea;
}(React.Component);

var Application = function (_React$Component7) {
	_inherits(Application, _React$Component7);

	function Application() {
		_classCallCheck(this, Application);

		var _this7 = _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).call(this));

		window.app = _this7;
		_this7.state = { login_layer: undefined, session_token: undefined };
		return _this7;
	}

	_createClass(Application, [{
		key: "render",
		value: function render() {
			return React.createElement(
				React.Fragment,
				null,
				React.createElement(Header, null),
				React.createElement(LeftSidebar, null),
				React.createElement(MainArea, null),
				app.state.login_layer != undefined && React.createElement(
					FullscreenLayer,
					null,
					app.state.login_layer == "login" ? React.createElement(LoginForm, null) : null
				)
			);
		}
	}]);

	return Application;
}(React.Component);

ReactDOM.render(React.createElement(Application, null), document.getElementById("react-container"));