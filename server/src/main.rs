use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use actix_files::Files;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone)]
struct Message {
    id: String,
    sender_id: String,
    receiver_id: String,
    content: String, // Зашифрованный контент
    timestamp: DateTime<Utc>,
}

#[derive(Default)]
struct AppState {
    messages: Arc<Mutex<Vec<Message>>>,
    users: Arc<Mutex<HashMap<String, String>>>, // user_id -> connection_id (упрощенно)
}

async fn index() -> HttpResponse {
    HttpResponse::Ok().body("Ручка Server is running! Use /api endpoints.")
}

#[derive(Deserialize)]
struct SendMessageRequest {
    sender_id: String,
    receiver_id: String,
    content: String,
}

#[derive(Serialize)]
struct SendMessageResponse {
    message_id: String,
    status: String,
}

async fn send_message(
    data: web::Data<Arc<AppState>>,
    body: web::Json<SendMessageRequest>,
) -> HttpResponse {
    let msg = Message {
        id: Uuid::new_v4().to_string(),
        sender_id: body.sender_id.clone(),
        receiver_id: body.receiver_id.clone(),
        content: body.content.clone(),
        timestamp: Utc::now(),
    };

    {
        let mut messages = data.messages.lock().unwrap();
        messages.push(msg.clone());
    }

    HttpResponse::Ok().json(SendMessageResponse {
        message_id: msg.id,
        status: "sent".to_string(),
    })
}

#[derive(Deserialize)]
struct GetMessagesRequest {
    user_id: String,
    contact_id: String,
}

async fn get_messages(
    data: web::Data<Arc<AppState>>,
    query: web::Query<GetMessagesRequest>,
) -> HttpResponse {
    let messages = data.messages.lock().unwrap();
    let chat_messages: Vec<Message> = messages
        .iter()
        .filter(|m| {
            (m.sender_id == query.user_id && m.receiver_id == query.contact_id)
                || (m.sender_id == query.contact_id && m.receiver_id == query.user_id)
        })
        .cloned()
        .collect();

    HttpResponse::Ok().json(chat_messages)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let app_state = Arc::new(AppState::default());

    log::info!("Starting Ruchka server at http://127.0.0.1:8080");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(app_state.clone()))
            .wrap(middleware::Logger::default())
            .route("/", web::get().to(index))
            .route("/api/send", web::post().to(send_message))
            .route("/api/messages", web::get().to(get_messages))
            .service(Files::new("/static", "./static").show_files_listing())
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}