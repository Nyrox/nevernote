#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket;
use rocket::response::{NamedFile};
use rocket::http::{Status, Cookie, Cookies};
use rocket::request::{self, FromRequest};
use rocket::{Request, State, Outcome};

extern crate rocket_contrib;
extern crate rand;

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



pub mod model {
	use rocket::http::{Status, Cookie, Cookies};
	use rocket::request::{self, FromRequest};
	use rocket::{Request, State, Outcome};
	use mysql as my;

    #[derive(Serialize, Deserialize)]
    pub struct User {
        pub id: u64,
        pub login: String,
        pub password: String,
    }

	#[derive(Serialize, Deserialize)]
	pub struct Note {
		pub id: u64,
		pub title: String,
		pub content: String,
	}

    #[derive(Serialize, Deserialize)]
    pub struct Session {
        pub token: u64,
        pub user_id: u64,
    }

	impl<'a, 'r> FromRequest<'a, 'r> for Session {
	    type Error = ();

	    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
			println!("{:?}", request);
			let token = request.cookies().get_private("NN-X-Session-Token");
			println!("{:?}", token);

			let pool = request.guard::<State<my::Pool>>()?;

			match token {
				Some(token) => {
					Outcome::Success(Session { token: token.value().parse().unwrap(), user_id: 0 })
				}
				None => Outcome::Forward(())
			}
	    }
	}
}

pub mod api {
    use DbConn;
    use my;
    use rocket_contrib::Json;
    use model::{Session, User, Note};
    use rand::{Rng, thread_rng};

    pub mod auth {
        use DbConn;
        use my;
        use rocket_contrib::Json;
		use rocket::http::{Status, Cookie, Cookies};
        use model::{Session, User};
        use rand::{Rng, thread_rng};

        #[derive(Serialize, Deserialize)]
        pub struct LoginRequest {
            pub login: String,
            pub password: String,
        }

        #[derive(Serialize, Deserialize)]
        pub struct LoginResponse {
            pub success: bool,
            // base 64 encoded
            pub session_token: u64,
            pub user_id: u64,
        }

        #[derive(Serialize, Deserialize)]
        pub struct RegisterRequest {
            pub email: String,
            pub login: String,
            pub password: String,
        }

        #[post("/api/auth/login", data="<request>")]
        pub fn login(request: Json<LoginRequest>, mut db_conn: DbConn) -> Json<LoginResponse> {
            let mut id = 0;

            {
                let mut result_set = db_conn.prep_exec("SELECT id FROM users WHERE (email=:login OR login=:login) AND password=:password", params!{
                    "login" => request.login.clone(),
				    "password" => request.password.clone()
			    }).unwrap();

                if let Some(row) = result_set.next() {
                    id = my::from_row(row.unwrap());
                }
                else {
                    return Json(LoginResponse { success: false, user_id: 0, session_token: 0 });
                }
            }

            return Json(LoginResponse { success: true, user_id: id, session_token: generate_session(id, &mut db_conn).token });
        }

        #[post("/api/auth/register", data="<request>")]
        pub fn register(request: Json<RegisterRequest>, mut db_conn: DbConn, mut cookies: Cookies) -> Json<LoginResponse> {
            db_conn.prep_exec("INSERT INTO users(email, login, password) VALUES(:email, :login, :password)", params!{
                "email" => request.email.clone(),
                "login" => request.login.clone(),
                "password" => request.password.clone(),
            }).unwrap();

            // Grab the inserted record, so we can store it in a session
            let mut inserted_id = 0;
            {
                let mut inserted = db_conn.prep_exec("SELECT id FROM users WHERE email=:email", params!{ "email" => request.email.clone() }).unwrap();
                inserted_id = my::from_row(inserted.next().unwrap().unwrap());
            }

			let session = generate_session(inserted_id, &mut db_conn);
			cookies.add_private(Cookie::new("NN-X-Session-Token", session.token.to_string()));

            return Json(LoginResponse { success: true, session_token: session.token, user_id: inserted_id });
        }

        fn generate_session(user_id: u64, db_conn: &mut DbConn) -> Session {
			println!("{:?}", ::std::thread::current().id());
            let session = Session { user_id, token: thread_rng().gen_range(1, ::std::u64::MAX) };
			println!("{}, {}", thread_rng().gen_range(1, ::std::u64::MAX), thread_rng().gen_range(1, ::std::u64::MAX));

            db_conn.prep_exec("INSERT INTO sessions(token, fk_user) VALUES(:token, :user_id)", params! {
                "token" => session.token,
                "user_id" => session.user_id,
            }).unwrap();

            return session;
        }
    }

    #[derive(Serialize, Deserialize)]
    pub struct PublicUserInfo {
        pub login: String,
    }

    #[get("/api/user/<user_id>")]
    pub fn get_user(user_id: u64, mut db_conn: DbConn) -> Option<Json<PublicUserInfo>> {
        let mut result_set = db_conn.prep_exec("SELECT login FROM users WHERE id=:id", params!{
            "id" => user_id
        }).unwrap();

        if let Some(row) = result_set.next() {
            return Some(Json(PublicUserInfo { login: my::from_row(row.unwrap()) }));
        }
        else {
            return None;
        }
    }


	#[derive(Serialize, Deserialize)]
	pub struct CreateNoteRequest {

	}

	#[post("/api/note/create", data="<request>")]
	pub fn create_note(request: Json<CreateNoteRequest>, mut db_conn: DbConn, session: Session) -> Json<Note> {
		Json(Note {
			id: 0,
			title: String::new(),
			content: String::new(),
		})
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
		.mount("/", routes![
            index,
            public_file,
            api::get_user,
			api::create_note,
            api::auth::login,
            api::auth::register
        ]).launch();
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
