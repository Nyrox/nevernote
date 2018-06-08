"use strict";


/*
Makes an API call to the server backend.
If body_data is defined, its assumed to be either a JSON string or an Object.
In the latter case it will be run through JSON.parse before being sent.
In both cases the Content-Type header will be set to application/json
The callback will be passed (status, responseText) as parameters.
This call is always asynchronous.
*/
function api_call(method, endpoint, body_data, cb) {
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			cb(this.status, this.responseText);
		}
	}

	xhttp.open(method, endpoint, true);

	let data = body_data;
	if (typeof data == "object") data = JSON.stringify(data);
	if (typeof data == "string") xhttp.setRequestHeader("Content-Type", "application/json");

	xhttp.send(data);
}


class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.state = { user_info: {} };

		if(app.state.user_id == 0) {
			console.error("Profile instantiated without a valid user_id.");
		}

		let self = this;
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let response = JSON.parse(this.responseText);
				self.setState({"user_info": JSON.parse(this.responseText)});
			}
		}
		xhttp.open("GET", "/api/user/" + app.state.user_id, true);
		xhttp.send();
	}

	render() {
		return (<div className="profile">
			<h2>{ this.state.user_info.login }</h2>
		</div>);
	}
}

class LoginStatus extends React.Component {

	render() {
		if (app.state.session_token) {
			return (<div className="login-status">
				<Profile />
			</div>);
		}
		else {
			return (<div className="login-status">
				<button onClick={() => { app.setState({"login_layer" : "login"}); }}>Sign in</button>
				<button onClick={() => { app.setState({"login_layer" : "register"}); }}>Sign up</button>
			</div>);
		}
	}
}

class FullscreenLayer extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(event) {
		if (event.target.classList.contains("layer-fullscreen")) {
			this.props.onClose();
		}
	}

	render() {
		return (<div className="layer-fullscreen" onClick={this.handleClick}>
			<div className="layer-inner">{ this.props.children }</div>
		</div>);
	}
}

class RegisterForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { login: "", password: "", email: "" };

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();

		api_call("POST", "/api/auth/register", { login: this.state.login, password: this.state.password, email: this.state.email }, function(status, response) {
			console.log(typeof response);
			if (status == 200) {
				let _response = JSON.parse(response);
				app.setState({"session_token": _response.session_token, "user_id": _response.user_id});
			}
			else {
				console.log(status, response);
			}
		});
	}

	handleChange(event) {
		let _state = {[event.target.name]: event.target.value};
		//state[event.target.name] = event.target.value;
		this.setState(_state);
	}

	render() {
		return (<form className="form-login"  onSubmit={this.handleSubmit}>
			<input name="email" placeholder="E-Mail" value={this.state.email} onChange={this.handleChange} />
			<input name="login" placeholder="Login" value={this.state.login} onChange={this.handleChange} />
			<input name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} type="password" />
			<input type="submit" value="Submit" />
		</form>);
	}
}

class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { login: "", password: "" };

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();

		api_call("POST", "/api/auth/login", { login: this.state, password: this.state.password }, function(status, response) {
			if (status == 200) {
				let response = JSON.parse(response);
				app.setState({"session_token": response.session_token, "user_id": response.user_id});
			}
			else {
				console.log(status, response);
			}
		})
	}

	handleChange(event) {
		let _state = {[event.target.name]: event.target.value};
		//state[event.target.name] = event.target.value;
		this.setState(_state);
	}

	render() {
		return (<form className="form-login"  onSubmit={this.handleSubmit}>
			<input name="login" value={this.state.login} onChange={this.handleChange} />
			<input name="password" value={this.state.password} onChange={this.handleChange} type="password" />
			<input type="submit" value="Submit" />
		</form>);
	}
}

class Header extends React.Component {
	render() {
		return (<div className="header">
			<h1>Cyka</h1>
			<LoginStatus />
		</div>);
	}
}

class LeftSidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = { tiles: [] };


	}

	render() {
		return (<div className="sidebar-left">
			<div className="toolbar">
				<img src="public/img/ui/new_note.svg" />
			</div>
			<ul className="note-list">
				{this.state.tiles}
			</ul>
		</div>);
	}
}


class Editor extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			note_id: 0,
			title: "Untitled Draft"
		};
	}

	componentDidMount() {
		CodeFlask.prototype.closeCharacter = function() { /* CodeFlask's default behaviour for this is just awful */ };

		this.state.flask_editor = new CodeFlask(".editor", {
			language: "none",
			lineNumbers: true,
			tabSize: 4,
		});

		window.flask = this.state.flask_editor;
	}

	render() {
		return (<div className="editor-container">
			<div className="toolbar">
				<input className="note-title" onChange={this.onChange.bind(this)} value={this.state.title} name="title"></input>

				<button onClick={this.save.bind(this)}>Save</button>
			</div>
			<div className="codeflask editor"></div>
		</div>);
	}

	onChange() {
		let _state = {[event.target.name]: event.target.value};
		this.setState(_state);
	}

	save() {
		api_call("POST", "/api/note/create", {}, function(status, response) {
			console.log(status, response);
		});
	}
}

class Application extends React.Component {
	constructor() {
		super();
		window.app = this;
		this.state = { login_layer: undefined, user_id: 0, session_token: undefined };
	}

	render() {
		return (<React.Fragment>
			<Header />
			<div className="main-area">
				<LeftSidebar />
				<Editor />
			</div>
			{ app.state.session_token == undefined && app.state.login_layer != undefined && <FullscreenLayer onClose={() => {app.setState({login_layer: undefined})}}>{ (app.state.login_layer == "login" ? <LoginForm /> : <RegisterForm />)}</FullscreenLayer>  }
		</React.Fragment>);
	}
}

ReactDOM.render(
	<Application />,
	document.getElementById("react-container")
);
