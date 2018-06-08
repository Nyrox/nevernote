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
			<p style={{fontSize: "10px"}}>Logged in:</p>
			<h2>{ this.state.user_info.login }</h2>
			<button onClick={() => { app.logout() }}>Logout</button>
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
				let response_data = JSON.parse(response);
				app.setState({user_id: response_data.user_id});
				app.updateSessionCookieInternal();
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
			<input type="submit" value="Register" />
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

		api_call("POST", "/api/auth/login", { login: this.state.login, password: this.state.password }, function(status, response) {
			if (status == 200) {
				let response_data = JSON.parse(response);
				app.setState({user_id: response_data.user_id});
				app.updateSessionCookieInternal();
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
			<input name="login" placeholder="Login/E-Mail" value={this.state.login} onChange={this.handleChange} />
			<input name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} type="password" />
			<input type="submit" value="Login" />
		</form>);
	}
}

class Header extends React.Component {
	render() {
		return (<div className="header">
			<h1>AE Software</h1>
			<button style={{marginRight: "auto", marginLeft: "48px"}} onClick={() => editor.updateContent(0, "New draft", "I like chickens!")}>New draft</button>
			<LoginStatus />
		</div>);
	}
}

class LeftSidebar extends React.Component {
	constructor(props) {
		super(props);
		window.sidebar = this;
		this.state = { tiles: [] };
		this.updateNoteList();
	}

	updateNoteList() {
		api_call("GET", "api/note/get/user/" + app.state.user_id, null, (function(status, response_text) {
			if (status != 200) { console.log(status, response_text); return; }

			let response = JSON.parse(response_text);
			this.state.tiles = response;
			this.forceUpdate();
		}).bind(this));
	}

	render() {
		return (<div className="sidebar-left">
			<ul className="note-list">
				{this.state.tiles.map((tile, index) => {
					console.log(tile);
					return <li onClick={() => this.onTileClicked(index)} key={tile.id}>{tile.title}</li>;
				})}
			</ul>
		</div>);
	}
}


class Editor extends React.Component {
	constructor(props) {
		super(props);
		window.editor = this;

		this.state = {
			id: 0,
			title: "Untitled Draft",
		};

		this.onChange = this.onChange.bind(this);
		this.save= this.save.bind(this);
		this.delete = this.delete.bind(this);
	}

	updateContent(id, title, content) {
		this.setState({id: id, title: title});
		this.state.flask_editor.updateCode(content);
		this.state.flask_editor.updateLineNumbersCount();
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
				<input className="note-title" onChange={this.onChange} value={this.state.title} name="title"></input>

				<div className="button-group">
					{ this.state.id != 0 && <button className="btn-delete" style={{marginRight: "16px"}} onClick={this.delete}>Delete</button> }
					<button onClick={this.save.bind(this)}>Save</button>
				</div>
			</div>
			<div className="codeflask editor"></div>
		</div>);
	}

	onChange(event) {
		let _state = {[event.target.name]: event.target.value};
		this.setState(_state);
	}

	save() {
		if (this.state.id == 0) {
			api_call("POST", "/api/note/create", { title: this.state.title, content: this.state.flask_editor.getCode() }, (function(status, response) {
				this.setState({id: JSON.parse(response).id})
				sidebar.updateNoteList();
			}).bind(this));
		}
		else {
			api_call("POST", "/api/note/save", { id: this.state.id, title: this.state.title, content: this.state.flask_editor.getCode() }, function(status, response) {
				sidebar.updateNoteList();
			})
		}
	}

	delete() {
		if(!window.confirm("Are you sure you want to delet this note?")) return;

		api_call("POST", "/api/note/delete/" + this.state.id, null, (function(status, responseText) {
			this.updateContent(0, "New draft", "I like chickens!");
			sidebar.updateNoteList();
		}).bind(this));
	}
}

class Application extends React.Component {
	getCookieValue(a) {
    	var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    	return b ? b.pop() : '';
	}

	updateSessionCookieInternal() {
		let session_token = this.getCookieValue("NN-X-Session-Token");
		if(session_token != "") {
			this.setState({session_token: session_token});
		}
	}

	logout() {
		api_call("GET", "/logout", null, (function(status, responseText) {
			if (status !== 200) { console.error(status, responseText); }

			this.setState({
				session_token: undefined,
				user_id: undefined
			});
		}).bind(this));
	}

	constructor() {
		super();
		window.app = this;
		this.state = { login_layer: undefined, user_id: 0, session_token: undefined };

		// Grab the session cookie if we have one
		let session_token = this.getCookieValue("NN-X-Session-Token");
		if(session_token != "") {
			this.state.session_token = session_token;
			this.state.user_id = parseInt(sessionStorage.getItem("user_id"));
		}
	}

	render() {
		sessionStorage.setItem("user_id", this.state.user_id);

		return (<React.Fragment>
			<Header />
			<div className="main-area">
				{ app.state.session_token != undefined ? (<React.Fragment>
					<LeftSidebar />
					<Editor />
				</React.Fragment>) : (<React.Fragment>
					<img src="/public/img/background.jpg" />
					<div className="teaser">
						<h1>Generic enterprise solutions for your trivial problems</h1>
						<h2>Register now to get the full benefit of absolutely overengineered software!</h2>
					</div>
				</React.Fragment>)}
			</div>
			{ app.state.session_token == undefined && app.state.login_layer != undefined && <FullscreenLayer onClose={() => {app.setState({login_layer: undefined})}}>{ (app.state.login_layer == "login" ? <LoginForm /> : <RegisterForm />)}</FullscreenLayer>  }
		</React.Fragment>);
	}
}

ReactDOM.render(
	<Application />,
	document.getElementById("react-container")
);
