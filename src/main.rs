#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket;
use rocket::response::{NamedFile};

extern crate rocket_contrib;

#[macro_use]
extern crate serde_derive;

use std::path::{Path, PathBuf};

pub mod api {
    pub mod auth {
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
        pub fn login(request: Json<LoginRequest>) -> Json<LoginResponse> {
            
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
    rocket::ignite().mount("/", routes![index, public_file, api::auth::login]).launch();
}
