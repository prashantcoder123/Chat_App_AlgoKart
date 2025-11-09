
Live Demo https://chat-app-algokart-3.onrender.com/


# 💬 TCP Chat Server — Backend Assignment (AlgoKart)

This project is built as part of the **AlgoKart Backend Internship Assignment**.  
It implements a **TCP-based chat server** with user login, message broadcasting, and real-time updates using **Node.js**.

---

## 🚀 Features

✅ Server listens on **port 4000** by default (as per assignment)  
✅ Login system using `LOGIN <username>` command  
✅ Broadcast messages using `MSG <text>` command  
✅ Show user join/disconnect notifications  
✅ List active users with `WHO` command  
✅ Graceful handling of invalid commands and duplicate usernames  
✅ Optional WebSocket + Express bridge for browser-based chat interface  
✅ Fully deployed on Render for demo access

---

## 🏗️ Tech Stack

| Layer | Technology |
|--------|-------------|
| Core Server | Node.js (TCP Socket – `net` module) |
| Bridge Server | Express.js + WS (WebSocket) |
| Frontend | HTML, CSS, JavaScript |
| Deployment | Render (Cloud hosting) |
| Tools | Nodemon, Git, npm |

## 🧱 Installation (Local Setup)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/Chat_App.git
cd Chat_App
npm install
node tcp_server.js
✅ TCP Chat Server running on port 4000
nodemon bridge_server.js
🌐 Bridge Server running on http://localhost:8080
🔗 Connected to TCP Chat Server
Visit 👉 http://localhost:8080

