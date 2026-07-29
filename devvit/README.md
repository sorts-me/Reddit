# Sortling Reddit App (`sorts-me/reddit`)

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Reddit Devvit](https://img.shields.io/badge/Reddit-Devvit%20SDK-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://developers.reddit.com)
[![REST API](https://img.shields.io/badge/Backend-REST%20CORS-46E3B7?style=for-the-badge&logo=fastapi&logoColor=white)](https://sortling-bot.onrender.com)

> **Universal Reddit Devvit application for the Sortling campus guide ecosystem. Enabling students to take interactive club matching quizzes and browse verified campus directories directly within Reddit Custom Posts.**

**Sortling Reddit App** brings interactive campus club discovery to Reddit. Built with Reddit's Devvit SDK, webroot HTML5 webviews, and asynchronous REST API fallback handlers, it streams quiz questions and club recommendations inside subreddit feeds.

---

> [!NOTE]
> ## REDDIT DEVVIT ARCHITECTURE
>
> This repository contains the TypeScript Devvit application and HTML5 webview entrypoint (`webroot/index.html`). It connects to the central Sortling REST API (`https://sortling-bot.onrender.com/api/`) to execute recommendation queries.

---

## 🏛️ Devvit App Architecture

```mermaid
graph TD
    A[Reddit User] -->|Open Custom Post| B(Devvit Webview index.html)
    B -->|POST /api/sessions/start| C[Sortling Central REST API]
    C -->|Return Question JSON| B
    B -->|Render Webview Quiz| A
    A -->|Select Option| B
    B -->|POST /api/sessions/answer| C
    C -->|Calculate Matches| D[DeterministicRecommendationEngine]
    D -->|Return Top 3 Recommendations| B
    B -->|Render Results Card| A
```

---

## 🌟 Key Features

* 📱 **Native Reddit Custom Posts**: Embeds interactive custom posts automatically on `AppInstall` or `AppUpgrade` events.
* ⚡ **High-Speed HTML5 Webview**: Clean, responsive UI styled with Sortling brand tokens (`#000543` background, `#ffffff` controls).
* 🔄 **Resilient REST API Fallback**: Connects to the central Sortling backend with graceful fallback handling for continuous uptime.
* 🎯 **Full Feature Parity**: Supports interactive multi-step matching quizzes, club detail lookups, and hackathon registries.
* 🛡️ **Devvit Menu Actions**: Subreddit moderator menu shortcut (`Create Sortling Campus Guide Post`) to generate custom posts on demand.

---

## 📂 Codebase Structure

* **`Devvit Entrypoint` ([main.ts](src/main.ts)):** Configures Reddit API triggers, installs custom post handlers, and defines moderator menu items.
* **`Webview Application` ([index.html](webroot/index.html)):** Single-page web app rendering Home, Quiz, Results, and Directory views with asynchronous fetch controllers.
* **`Configuration` ([devvit.json](devvit.json)):** Manifest specifying app permissions (Reddit API, HTTP), webroot entrypoints, and target subreddits.

---

## 🛠️ CLI Development & Deployment

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/sorts-me/Reddit.git
   cd Reddit
   npm install
   ```

2. Playtest locally on Reddit:
   ```bash
   npx @devvit/cli playtest r/sortling_dev
   ```

3. View live app logs:
   ```bash
   npx @devvit/cli logs r/sortling_dev --since 1h
   ```

4. Upload and publish new version to Reddit:
   ```bash
   npx @devvit/cli upload
   ```

---

## 📜 License

Licensed under the MIT License.
