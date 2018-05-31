"use strict";

window.flask_editor = new CodeFlask("#editor", { language: "none" });


class LoginStatus extends React.Component {
	
	render() {
		if (app.state.session_token) {
			return (<div className="login-status">
				
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
	constructor(props) { super(props); }

	render() {
		return <div className="layer-fullscreen"><div className="layer-inner">{ this.props.children }</div></div>;
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
				console.log(response);
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
			<LoginStatus />
		</div>);
	}
}

class LeftSidebar extends React.Component {
	render() {
		return <div className="sidebar-left"></div>
	}
}

class MainArea extends React.Component {
	render() {
		return <main className="main-area"></main>
	}
}

class Application extends React.Component {
	constructor() {
		super();
		window.app = this;
		this.state = { login_layer: undefined, session_token: undefined };
	}

	render() {
		return (<React.Fragment>
			<Header />
			<LeftSidebar />
			<MainArea />
			{ app.state.login_layer != undefined && <FullscreenLayer>{ (app.state.login_layer == "login" ? <LoginForm /> : null)}</FullscreenLayer>  }
		</React.Fragment>)
	}
}



ReactDOM.render(
	<Application />,
	document.getElementById("react-container")
);

