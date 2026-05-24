# Chatox

A modern full-stack social media platform inspired by real-time communication systems. Chatox delivers seamless social interaction with live messaging, dynamic feeds, notifications, media sharing, polls, scheduling, and responsive UI experiences.

---

## Features

- Real-time messaging using WebSockets
- Live notifications system
- Tweet/Post creation with image uploads
- Poll creation and voting
- Scheduled posts
- Follow / unfollow users
- Like and reply system
- Dark / Light mode support
- Responsive modern UI
- Profile pages and user feeds
- Async background task processing
- Authentication and authorization

---

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Zustand
- Axios
- CSS Modules
- Tailwind CSS

### Backend
- Django
- Django REST Framework
- Django Channels
- WebSockets
- Celery
- Redis
- PostgreSQL

---

## Architecture

### Real-Time Communication
Implemented real-time bidirectional communication using:

- Django Channels
- ASGI
- WebSockets
- Redis Channel Layer

This enables:
- Instant messaging
- Live updates
- Realtime notifications

---

### Background Tasks
Integrated Celery + Redis for asynchronous task processing:

- Notification handling
- Email jobs
- Scheduled tasks
- Future scalability for analytics and media processing

---

## Key Functionalities

### Authentication System
- JWT Authentication
- Secure login/signup flow
- Protected routes and APIs

### Tweet System
- Create, delete, and interact with posts
- Image uploads with previews
- Poll support
- Scheduled publishing
- Location support

### Social Features
- Follow / unfollow users
- Like system
- Reply threads
- Share links
- Copy tweet links

### Notifications
- Like notifications
- Follow notifications
- Realtime delivery support

---

## Database

PostgreSQL is used for:
- User management
- Tweet storage
- Polls
- Notifications
- Relationships and interactions

---

## Project Structure

```bash
chatox/
│
├── backend/
│   ├── users/
│   ├── tweets/
│   ├── chat/
│   ├── notifications/
│   ├── config/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── api/
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/chatox.git
cd chatox
```

---

## Backend Setup

### Create Virtual Environment

```bash
python -m venv env
source env/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run PostgreSQL & Redis

```bash
sudo service postgresql start
sudo service redis-server start
```

### Apply Migrations

```bash
python manage.py migrate
```

### Start Backend

```bash
python manage.py runserver
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Celery Worker

```bash
celery -A config worker -l info
```

---

## Future Improvements

- Stories feature
- Video uploads
- Realtime typing indicators
- AI-powered recommendations
- Infinite scrolling
- Push notifications
- Hashtag trending system
- Voice/video calling

---

## Screenshots

Add your project screenshots here.

---

## Author

Drishti Rajput


This project is developed for learning, experimentation, and portfolio purposes.
