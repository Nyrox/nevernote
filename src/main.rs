#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket;
use rocket::response::{NamedFile};
use rocket::http::Status;
use rocket::request::{self, FromRequest};
use rocket::{Request, State, Outcome};

extern crate rocket_contrib;

#[macro_use]
extern crate serde_derive;

#[macro_use]
extern crate mysql;
use mysql as my;
use my::prelude::*;

use std::path::{Path, PathBuf};
use std::ops::{Deref, DerefMut};

// Connection request guard type: a wrapper around a pooled connection.
pub struct DbConn(pub my::PooledConn);

/// Attempts to retrieve a single connection from the managed database pool. If
/// no pool is currently managed, fails with an `InternalServerError` status. If
/// no connections are available, fails with a `ServiceUnavailable` status.
impl<'a, 'r> FromRequest<'a, 'r> for DbConn {
    type Error = ();

    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        let pool = request.guard::<State<my::Pool>>()?;
        match pool.get_conn() {
            Ok(conn) => Outcome::Success(DbConn(conn)),
            Err(_) => Outcome::Failure((Status::ServiceUnavailable, ()))
        }
    }
}

// For the convenience of using an &DbConn as an &SqliteConnection.
impl Deref for DbConn {
    type Target = my::PooledConn;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for DbConn {
	fn deref_mut(&mut self) -> &mut Self::Target {
		&mut self.0
	}
}

pub mod api {
    pub mod auth {
		use DbConn;
		use rocket_contrib::Json;

        #[derive(Serialize, Deserialize)]
        pub struct LoginRequest {
            pub login: String,
            pub password: String,
        }

        #[derive(Serialize, Deserialize)]
        pub struct LoginResponse {
            pub success: bool,
            // base 64 encoded
            pub session_token: String,
        }

        #[post("/api/auth/login", data="<request>")]
        pub fn login(request: Json<LoginRequest>, mut db_conn: DbConn) -> Json<LoginResponse> {
			let mut result_set = db_conn.prep_exec("SELECT * FROM users WHERE login=:login AND password=:password", params!{
				"login" => request.login.clone(),
				"password" => request.password.clone()
			}).unwrap();

			println!("{:?}", result_set.next());


            let response = LoginResponse { success: true, session_token: "kebab".to_owned() };
            Json(response)
        }
    }
}

#[get("/")]
fn index() -> NamedFile {
    NamedFile::open("public/index.html").unwrap()
}

#[get("/public/<file..>")]
fn public_file(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("public/").join(file)).ok()
}




fn main() {
    rocket::ignite()
		.manage(create_mysql_pool())
		.mount("/", routes![index, public_file, api::auth::login])
		.launch();
}



fn create_mysql_pool() -> my::Pool {
	let mut builder = my::OptsBuilder::new();
	builder
		// TODO: Use dotenv
		.user(Some("root"))
		.pass(Some(""))
		.ip_or_hostname(Some("localhost"))
		.db_name(Some("nevernote"))
		// Needed on windows, because for some reason mysql thinks that file socket exist on windows
		.prefer_socket(false);

	let options = my::Opts::from(builder);

	my::Pool::new(options).expect("Critical Error: Failed to build mysql connection pool...")
}
