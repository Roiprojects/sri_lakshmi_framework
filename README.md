# Sri Lakshmi Studio - Project Deployment Guide

This project is a Node.js web application built with Express and Supabase. It has been pre-configured for **Zero-Config Deployment**.

## 🚀 Quick Start (For the Senior Developer)

The project is ready to go. You do not need to configure any environment variables as the database credentials and admin settings are already integrated into the backend logic.

1.  **Clone/Extract** the project files.
2.  Open your terminal in the project root.
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the server:
    ```bash
    npm start
    ```
5.  Access the site at `http://localhost:3000` (or your server's public URL).

## 📁 Project Structure
- `server.js`: The main Express server and API (Entry Point).
- `src/`: Contains all frontend assets (HTML, CSS, JS, Images).
- `package.json`: Project dependencies and scripts.

## 🔑 Credentials
- **Admin Panel:** `/admin`
- **Default Password:** `LakshmiAdmin2026` (Hardcoded in `server.js`)
- **Database:** Supabase (Pre-linked)

## 📌 Important Hosting Notes
- **Node.js Required:** This is a dynamic app; it requires a Node.js environment to run.
- **Port:** The app listens on the port specified by the `PORT` environment variable, defaulting to `3000`.
- **Static Assets:** The `src` folder contains all public-facing assets, and the server is configured to handle routing for clean URLs (e.g., `/about` instead of `about.html`).
