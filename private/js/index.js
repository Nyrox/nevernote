"use strict";

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

		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let response = JSON.parse(this.responseText);
				console.log(response);
			}
		}
		xhttp.open("POST", "/api/auth/register", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send(JSON.stringify({ login: this.state.login, password: this.state.password, email: this.state.email }));
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

		//
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let response = JSON.parse(this.responseText);
				app.setState({"session_token": response.session_token, "user_id": response.user_id});
			}
		}
		xhttp.open("POST", "/api/auth/login", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send(JSON.stringify({ login: this.state.login, password: this.state.password }));
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

		this.state = {};
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
				<div className="tabs">
					{this.state.open_tabs}
				</div>
			</div>
			<div className="codeflask editor"></div>
		</div>);
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
