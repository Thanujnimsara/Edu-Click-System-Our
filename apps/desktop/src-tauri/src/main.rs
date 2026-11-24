#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::{Manager, Window};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub platform: String,
    pub os_version: String,
    pub app_version: String,
    pub device_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationPayload {
    pub title: String,
    pub body: String,
}

// 1. Get Windows & Hardware Device Info for Cross-Device Session Tracking
#[tauri::command]
fn get_system_info() -> SystemInfo {
    let hostname = std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .unwrap_or_else(|_| "Windows PC".to_string());

    SystemInfo {
        platform: "WINDOWS".to_string(),
        os_version: "Windows 10/11 64-bit".to_string(),
        app_version: "4.0.0".to_string(),
        device_name: format!("{} (EDU CLICK Desktop)", hostname),
    }
}

// 2. Native Windows Action Center Notification
#[tauri::command]
fn send_desktop_notification(app_handle: tauri::AppHandle, payload: NotificationPayload) -> Result<(), String> {
    tauri::api::notification::Notification::new(&app_handle.config().tauri.bundle.identifier)
        .title(&payload.title)
        .body(&payload.body)
        .icon("icons/icon.ico")
        .show()
        .map_err(|e| e.to_string())
}

// 3. Native Screen / Window Fullscreen Toggle for Live Classes
#[tauri::command]
fn toggle_live_fullscreen(window: Window) -> Result<bool, String> {
    let current_state = window.is_fullscreen().map_err(|e| e.to_string())?;
    window.set_fullscreen(!current_state).map_err(|e| e.to_string())?;
    Ok(!current_state)
}

// 4. Native PDF Receipt / Certificate File Saver
#[tauri::command]
async fn save_file_to_desktop(filename: String, content: String) -> Result<String, String> {
    let home = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".to_string());
    let path = std::path::Path::new(&home).join("Downloads").join(&filename);
    
    std::fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            send_desktop_notification,
            toggle_live_fullscreen,
            save_file_to_desktop
        ])
        .setup(|app| {
            if let Some(main_window) = app.get_window("main") {
                let _ = main_window.set_title("EDU CLICK – One Platform. Every Device. Every Student.");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running EDU CLICK desktop application");
}
