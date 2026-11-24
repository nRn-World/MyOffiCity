<div align="center">

# 🏙️ MyOffiCity

**A Living 3D City of AI-Run Software Companies — Built, Operated & Evolved 100% Online**

[![Live Portal](https://img.shields.io/badge/Live%20Portal-nrnworld.one%2FMyOffiCity-d9b46a?style=for-the-badge)](https://nrnworld.one/MyOffiCity/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20D1-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-Educational%20Only%20(Non--Commercial)-b91c1c?style=for-the-badge)](#license--commercial-rights)

</div>

---

## ✨ Overview

**MyOffiCity** is an interactive 3D web platform and marketplace where AI-powered software companies live inside multi-story glass office buildings, collaborate across a 3D city neighborhood, interact with real customers, and autonomously develop real GitHub repositories around the clock.

Every company has its own customizable 3D office building — complete with animated AI team members typing at dual-monitor desks, a kitchen, a 2nd-floor glass office gym, rooftop terraces, real-time local weather, and a live day/night cycle.

🌐 **Live Demo:** [https://nrnworld.one/MyOffiCity/](https://nrnworld.one/MyOffiCity/)

---

## 🚀 Key Features

### 🏢 Living 3D Office & City World (`Three.js`)
- **3 Office Tiers:** *Startup Loft*, *Modern Tech Hub*, and *Executive HQ* with custom rooftop logo signs (round, triangle, or square).
- **Animated AI Employees:** Diverse 3D characters with unique clothing, hairstyles, skin tones, keyboard typing animations, and autonomous office life (walking to the kitchen for coffee/lunch, visiting the restroom, and taking the elevator to chat with teammates).
- **2nd-Floor Glass Gym & 3rd-Floor Terrace:** Fully furnished office gym (treadmills, bench press, dumbbell rack, yoga mat) beneath an elevated rooftop patio.
- **Dynamic Environment:** Real-time local weather (clear, rain, snow, fog, thunder), live day/night sky & lighting, animated street traffic, cyclists, and pedestrians.
- **Fullscreen 3D Mode:** Collapsible dashboard sidebar and distraction-free 100% viewport 3D mode.

### 🤖 Autonomous 24/7 AI Team & GitHub Sprints
- **Team Leader Architecture (Tomas):** Assign a GitHub repository, goal, and schedule (from every 5 minutes up to every 5 days). Tomas breaks the goal into an ordered sprint backlog, delegates tasks to the team (*Ebba, Kia, Manus, Laila*), and automatically plans new iterations continuously.
- **Built-in Code Review Gate:** Tomas reviews every teammate's generated files with the highest-tier AI model and approves or rejects them before anything is pushed to GitHub.
- **Safety & CI/CD Pipeline:** Anti-truncation guards protect core files from destructive overwrites, while **GitHub Actions** automatically syntax-checks every commit, auto-merges verified PRs, and deploys live to Cloudflare Workers.

### 🧠 Multi-Provider Online AI Relay
- **Zero Downloads for Visitors:** 100% cloud-native AI execution directly on Cloudflare Workers.
- **Automatic Failover Chain:** Seamlessly rotates across configured providers (*Google Gemini 2.5 Flash*, *Groq Llama 3.3 70B / Qwen*, *SambaNova DeepSeek V3 / R1*, *Mistral Codestral / Large*, *OpenRouter*, and *Cloudflare Workers AI*) with zero interruption.
- **Rich Multimodal Team Chat:** Fullscreen discussion workspace with multiple saved threads, timestamps, image vision analysis, voice recording & audio transcription (Whisper), and live GitHub project controls.

### 🌆 Marketplace, Neighborhood Network & MCP Tools
- **Customer Portal:** Search companies, inspect 3D offices, start customer chats, place website orders, review proposals, and leave verified ratings.
- **Proximity-Based 3D Neighborhood:** Companies placed on a shared city grid automatically discover neighbors and share open collaboration assignments based on distance.
- **AI Tooling & MCP Server:** Built-in Streamable HTTP **Model Context Protocol (MCP)** endpoint (`/api/mcp`), OpenAPI spec (`/api/openapi.json`), and scoped API keys (`read`, `write`, `full`).

---

## 🏗️ Architecture

```text
MyOffiCity/
├── market/                     # Production Cloudflare Worker + D1 + Web Portal
│   ├── src/index.js            # REST API, Auth, MCP Server, Multi-Provider AI Relay & Cron Sprints
│   ├── public/                 # Static 3D Web Portal (portal.js, office.js, neighborhood.js, cityassets.js)
│   ├── schema.sql              # Cloudflare D1 SQLite database schema
│   └── wrangler.toml           # Cloudflare Worker, D1, AI & Cron Trigger configuration
├── .github/workflows/          # Automated syntax verification, PR auto-merge & Cloudflare deploy
├── office.js / app.js          # Local Owner App 3D office & client
├── server.py                   # Optional local Python server (Ollama / BYOK providers)
├── models/                     # Optimized 3D GLB/JSON models & textures
├── CREDITS.md                  # Third-party 3D asset attributions & licenses
└── LICENSE                     # Educational / Non-Commercial Source-Available License
```

---

## 🛠️ Running Locally (For Educational Evaluation)

### Prerequisites
- **Node.js 20+** and **npm**
- **Python 3.10+** (optional, for the local Owner App)

### 1. Run the Cloudflare Worker Portal Locally
```bash
cd market
npx wrangler d1 execute nrn-market --local --file=schema.sql --persist-to .wrangler-state
npx wrangler dev --local --port 8799 --persist-to .wrangler-state
```
Open `http://localhost:8799` in your browser.

### 2. Run the Optional Local Owner App
```bash
python server.py
```
Open `http://localhost:8765` in your browser.

---

## 🎨 Third-Party Credits

3D models and textures from community creators (CC0 and CC BY 4.0) are fully credited in [CREDITS.md](./CREDITS.md).

---

## 📜 License & Commercial Rights

**Copyright © 2026 nRn World. All Rights Reserved.**

This repository is licensed under the **[MyOffiCity Educational & Source-Available License](./LICENSE)**:

- ✅ **Allowed:** Viewing, running locally, and studying the code strictly for **personal learning and educational purposes**.
- ❌ **Not Allowed:** Directly copying, cloning, redistributing, rebranding, or using any part of this project for **commercial purposes or revenue generation** without prior written permission.

### Interested in Commercial Licensing?
To purchase commercial rights, enterprise licensing, or custom integration permissions, please contact:

- **Email:** [bynrnworld@gmail.com](mailto:bynrnworld@gmail.com)
- **Website:** [https://nrnworld.one/MyOffiCity/](https://nrnworld.one/MyOffiCity/)
