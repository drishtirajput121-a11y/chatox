<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white"/>
  <img src="https://img.shields.io/badge/Django%20Channels-0C4B33?style=for-the-badge&logo=django&logoColor=white"/>
  <img src="https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=socketdotio&logoColor=white"/>
  <img src="https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-D82C20?style=for-the-badge&logo=redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
</p>

# Chatox — Real-Time Social Media Platform

Chatox is a modern full-stack social media platform engineered around realtime communication, scalable async processing, and responsive frontend architecture. The application combines React.js frontend rendering with Django REST APIs, Django Channels powered WebSockets, Celery background workers, Redis event streaming, and PostgreSQL relational persistence.

The platform delivers realtime social interaction features including instant messaging, live notifications, tweet feeds, media uploads, polls, scheduling systems, user engagement tracking, and responsive multi-device rendering.

---

# Platform Demonstrations

## Authentication Workflow

The authentication system provides JWT-secured login and registration with protected API routing and persistent session handling.

<div align="center">
  <img src="demo/login.png" width="48%">
  <img src="demo/register.png" width="48%">
</div>

---

## Feed Interface & Tweet Composer

This section demonstrates the responsive tweet feed architecture, media upload previews, poll creation system, and realtime interaction components.

<img src="demo/feed.gif" width="100%" height="auto">

---

## Realtime Messaging & Notifications

Realtime communication is implemented using Django Channels + WebSockets enabling instant message delivery and live notification broadcasting.

<img src="demo/chat.gif" width="100%" height="auto">

---

# Why Chatox?

Most social platforms become overloaded with unnecessary UI complexity and fragmented realtime systems. Chatox focuses on scalable realtime communication with clean modular architecture.

### Core Design Goals

1. **Realtime First Architecture**  
   WebSockets enable instant bidirectional communication without inefficient polling loops.

2. **Scalable Backend Infrastructure**  
   Redis-backed Channels layers and Celery workers allow asynchronous task distribution and scalable event handling.

3. **Responsive Modern UI**  
   Optimized React component architecture with responsive layouts for desktop and mobile devices.

4. **Modular Full-Stack Design**  
   Independent frontend/backend separation using DRF APIs improves maintainability and deployment flexibility.

---

# Core Feature Architecture

| Functional Area | Feature Description | Key Technology |
|---|---|---|
| Authentication System | JWT login, protected routes, token persistence | Django REST, SimpleJWT |
| Realtime Messaging | Bidirectional websocket communication | Django Channels, WebSockets |
| Async Task Processing | Notification queues and background workers | Celery, Redis |
| Tweet Feed System | Dynamic social feed rendering | React.js, DRF |
| Media Uploads | Multi-image tweet attachments with previews | React Hooks, Django Media |
| Poll System | Interactive poll creation and voting | PostgreSQL, React State |
| Live Notifications | Instant follow/like notifications | Channels, Redis |
| User Relationships | Follow / unfollow architecture | PostgreSQL Relations |
| Responsive UI | Mobile + desktop adaptive layouts | CSS Modules, Tailwind |
| State Management | Global auth and UI state handling | Zustand |

---

# Realtime Communication Architecture

Chatox uses ASGI-powered websocket infrastructure through Django Channels.

### WebSocket Features

- Instant messaging
- Live notifications
- Realtime feed updates
- Online/offline user states
- Typing indicators
- Event broadcasting

---

# Async Task Queue System

Celery workers handle asynchronous background jobs separated from synchronous API execution.

### Celery Responsibilities

- Notification delivery
- Email jobs
- Delayed tasks
- Scheduled jobs
- Background processing

### Redis Usage

Redis acts as:

- Celery broker
- Channel layer backend
- Temporary cache store
- Event pub/sub layer

---

# Database Design

PostgreSQL manages structured relational data including:

- Users
- Tweets
- Likes
- Replies
- Notifications
- Polls
- Relationships
- Message persistence

---

# Project Structure

```bash
chatox/
│
├── backend/
│   ├── users/
│   ├── tweets/
│   ├── chat/
│   ├── notifications/
│   ├── config/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── api/
│   └── assets/
│
└── README.md
```

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register/` | Register new account |
| POST | `/api/token/` | Obtain JWT tokens |
| POST | `/api/token/refresh/` | Refresh expired token |

---

## Tweets

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tweets/` | Fetch tweet feed |
| POST | `/api/tweets/` | Create new tweet |
| POST | `/api/tweets/:id/like/` | Toggle like |
| DELETE | `/api/tweets/:id/` | Delete tweet |

---

## Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/:username/` | Fetch user profile |
| POST | `/api/follow/:username/` | Follow/unfollow user |

---

## Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications/` | Fetch notifications |
| POST | `/api/notifications/read/` | Mark notifications read |

---

# Frontend Stack

- React.js
- Vite
- React Router DOM
- Zustand
- Axios
- Tailwind CSS
- CSS Modules
- React Icons

---

# Backend Stack

- Django
- Django REST Framework
- Django Channels
- Celery
- Redis
- PostgreSQL

---

# Local Setup

## Backend

```bash
cd backend

python -m venv env
source env/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

---

## Redis

```bash
sudo service redis-server start
```

---

## Celery Worker

```bash
celery -A config worker -l info
```

---

## Frontend

```bash
cd frontend

npm install
npm run dev
```

---

# Future Improvements

- Stories system
- Video uploads
- Voice/video calling
- AI recommendations
- Infinite scrolling feeds
- Push notifications
- Trending hashtags
- Group chats

---

# Author

**Drishti Rajput**
