# Chatox: Professional Real-Time Social Media Platform

An enterprise-grade, full-stack social media application designed for high-concurrency real-time communication, asynchronous background computing, and highly responsive multi-device layouts. Chatox integrates modern front-end state management with a robust service-oriented backend architecture.

---

## Architectural Topology

Chatox utilizes a decoupled distributed architecture to ensure low-latency message delivery, decoupled task management, and consistent visual styling.

### System Components Flow

```mermaid
graph TD
    %% Clients
    Client[React SPA Frontend]
    
    %% Gateway / Server Layers
    Daphne[ASGI Daphne Server]
    WSGI[WSGI Web Server]
    
    %% API & WebSockets handlers
    DRF[Django REST Framework API]
    Channels[Django Channels Consumers]
    
    %% Async Infrastructure
    Celery[Celery Task Workers]
    RedisBroker[Redis Queue Broker & Channels Layer]
    
    %% Persistance Layer
    Postgres[(PostgreSQL Relational DB)]
    Cloudinary[Cloudinary Media Hosting]
    OpenRouter[OpenRouter AI API]

    %% Connections
    Client -- HTTP Requests --> WSGI
    Client -- WebSocket Handshake --> Daphne
    
    WSGI --> DRF
    Daphne --> Channels
    
    DRF --> Postgres
    DRF --> OpenRouter
    DRF --> Cloudinary
    
    Channels --> RedisBroker
    Channels --> Postgres
    
    Celery --> RedisBroker
    Celery --> Postgres
```

---
## Technical Specifications
 
### Frontend Technology Stack
*   **Core Framework:** React 18+ with Vite for fast HMR compilation.
*   **State Management:** Zustand (for client-side auth context, theme settings, and real-time notification states).
*   **Routing:** React Router DOM (implementing declarative route protection and layout nests).
*   **Network Protocol:** Axios client with automated interceptors for persistent bearer token authentication.
*   **Styling & Theme:** Tailwind CSS supporting reactive system-wide Dark Mode.
*   **Iconography:** React Icons (Heroicons v2).
### Backend Technology Stack
*   **Core Framework:** Django 5.1 (configured as a modular API provider and ASGI WebSocket coordinator).
*   **API Architecture:** Django REST Framework (DRF) with custom serialization pipelines.
*   **Authentication:** JSON Web Tokens (SimpleJWT) with short-lived access keys and secure rotation.
*   **WebSocket Engine:** ASGI-compliant Django Channels integrating a Redis channel layer broker.
*   **Worker Pipelines:** Celery Async Task Processor executing background scheduled delivery jobs.
*   **Performance:**
    *   **N+1 Query Prevention:** Strategic use of `select_related` and `prefetch_related` across all list endpoints to eliminate redundant database queries.
    *   **API Throttling:** DRF throttle classes applied globally and per-endpoint to rate-limit requests and protect against abuse.
*   **Persistence Stores:**
    *   **PostgreSQL:** Relational database storage for complex user profiles, feed trees, relations, and messages.
    *   **Redis:** In-memory caching, message broker for Celery, and pub/sub layer for WebSocket routing.
    *   **Cloudinary:** Content Delivery Network (CDN) cloud storage for optimized user avatars, banners, and multi-image post media.
---

## Interactive Interface Visual Showcases

To illustrate the visual presentation of the platform, the following UI placeholders demarcate where screenshots of the system should be embedded:

### 1. User Access Control Interfaces

| User Registration Dashboard | Secured Login Dashboard |
|:---:|:---:|
| <div align="center" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 8px; padding: 40px 20px; font-family: monospace;">[ Register Page Screenshot Placeholder ]<br><br>• Account validation<br><br>• Real-time availability checks</div> | <div align="center" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 8px; padding: 40px 20px; font-family: monospace;">[ Login Page Screenshot Placeholder ]<br><br>• JWT credentials submission<br><br>• Route token authorization</div> |

---

### 2. Main Social Stream & Interactions

<div align="center" style="background: #0f172a; color: #e2e8f0; border: 1px solid #1e293b; border-radius: 12px; padding: 60px 40px; font-family: monospace; margin-bottom: 20px;">
  <h4>[ Main Home Feed Page Placeholder - Light & Dark Modes ]</h4>
  <p>Renders a centralized feed stream displaying published posts, integrated interactive polls, active like counters, dynamic location maps, and scheduled publish states.</p>
</div>

<div align="center" style="background: #0f172a; color: #e2e8f0; border: 1px solid #1e293b; border-radius: 12px; padding: 60px 40px; font-family: monospace; margin-bottom: 20px;">
  <h4>[ Advanced Post Composer & Media Picker Placeholder ]</h4>
  <p>Showcases multi-image drag-and-drop file inputs, active polling configurations, scheduling controls, and OpenRouter AI dynamic prompt caption generator output.</p>
</div>

---

### 3. Messaging & Notification Dashboards

| Real-Time Active DM Interface | Centralized Notification Dashboard |
|:---:|:---:|
| <div align="center" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 8px; padding: 50px 20px; font-family: monospace;">[ Direct Messaging Page Placeholder ]<br><br>• Continuous WebSocket sessions<br>• Real-time typing indicators<br>• Infinite-scrolled message logs</div> | <div align="center" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 8px; padding: 50px 20px; font-family: monospace;">[ Notifications Feed Placeholder ]<br><br>• Segmented feed categories<br>• Instant Follows & Retweets notifications<br>• Global read updates</div> |

---

### 4. Custom Profiles & Platform Administration

<div align="center" style="background: #0f172a; color: #e2e8f0; border: 1px solid #1e293b; border-radius: 12px; padding: 60px 40px; font-family: monospace;">
  <h4>[ User Profile Page & Relationship Modals Placeholder ]</h4>
  <p>Displays unique user profile headers, bio updates, multi-image lists, followers/following counts, and quick follow relationships.</p>
</div>

---

## Detailed Data Directory Map

### Frontend Navigation Directory (`/frontend/src/pages`)

| Page Component | Local Path | Application Access | Responsibility & Scope |
|:---|:---|:---|:---|
| `LoginPage` | `src/pages/LoginPage.jsx` | Guest Only | JWT credential transmission, login forms, token storage trigger. |
| `RegisterPage` | `src/pages/RegisterPage.jsx` | Guest Only | New profile registrations, avatar image pre-rendering. |
| `FeedPage` | `src/pages/FeedPage.jsx` | Authenticated | Post feed displaying chronological tweets from followed users. |
| `ExplorePage` | `src/pages/ExplorePage.jsx` | Authenticated | Global post discovery filtering by keywords, profiles, or tags. |
| `NotificationsPage` | `src/pages/NotificationsPage.jsx` | Authenticated | Renders persistent interaction histories (follows, likes, retweets). |
| `ChatPage` | `src/pages/ChatPage.jsx` | Authenticated | Real-time direct chat log listing, active session indicators. |
| `ProfilePage` | `src/pages/ProfilePage.jsx` | Authenticated | Public profiles, bio statistics, relationship toggles. |
| `TweetDetailPage` | `src/pages/TweetDetailPage.jsx` | Authenticated | Singular tweet thread rendering, replies list, active poll scores. |
| `SettingsPage` | `src/pages/SettingsPage.jsx` | Authenticated | Direct settings configuration, account updates, profile picture edits. |

### Frontend UI Component Index (`/frontend/src/components`)

| UI Component | Local Path | Component Scope & Responsibility |
|:---|:---|:---|
| `Layout` | `src/components/Layout.jsx` | High-level sidebar container, dark mode toggle, global trends. |
| `ComposeBox` | `src/components/ComposeBox.jsx` | Rich text inputs, file upload bindings, schedule, and poll setups. |
| `TweetCard` | `src/components/TweetCard.jsx` | Displays structured post content (images, likes, deletion rules). |
| `PollComposer` | `src/components/PollComposer.jsx` | Direct form control builder for creating interactive post choices. |
| `PollDisplay` | `src/components/PollDisplay.jsx` | Handles user vote selection, calculates percentages in real-time. |
| `SchedulePicker` | `src/components/SchedulePicker.jsx` | Captures calendar dates/times for delayed post scheduling. |
| `LocationPicker` | `src/components/LocationPicker.jsx` | Captures location attributes to attach metadata to posts. |
| `FollowListModal` | `src/components/FollowListModal.jsx` | Displays profiles within follower/following lists. |
| `MediaPreviews` | `src/components/MediaPreviews.jsx` | Visual image grids for pending media attachments. |
| `MessageToast` | `src/components/MessageToast.jsx` | Bottom-screen real-time notifications for new chat interactions. |

### Backend Service Directory (`/backend`)

| App Module | Core Responsibility | Primary Django Modules |
|:---|:---|:---|
| `users` | Handles user registrations, custom schemas, and relationship trees. | `models.py`, `views.py`, `serializers.py`, `urls.py` |
| `tweets` | Post creations, media processing, trending systems, and polls. | `models.py`, `views.py`, `serializers.py`, `tasks.py` |
| `chat` | Real-time messaging, active room states, and socket handshakes. | `consumers.py`, `models.py`, `views.py`, `routing.py` |
| `notifications` | Social system alerts, updates, and read states. | `models.py`, `views.py`, `serializers.py`, `urls.py` |
| `chatox` | Settings configuration, root routes, and WSGI/ASGI gateways. | `settings.py`, `urls.py`, `asgi.py`, `celery.py` |

---

## Service Communication Workflows

### 1. Direct Messaging Real-Time Protocol

This sequence illustrates the communication pipeline when User A sends a direct message to User B via WebSockets:

```mermaid
sequenceDiagram
    autonumber
    actor ClientA as User A Frontend
    participant ServerWS as Daphne WebSocket Server
    participant Redis as Redis Pub/Sub & Channel Layer
    actor ClientB as User B Frontend

    Note over ClientA, ServerWS: WebSocket Connection Established at /ws/chat/UserB/
    ClientA->>ServerWS: Sends Text JSON { "content": "Hello User B" }
    
    activate ServerWS
    ServerWS->>ServerWS: Authenticates User A Session (JWT Scope Middleware)
    ServerWS->>ServerWS: Persists Message to PostgreSQL (Database Transaction)
    
    ServerWS-->>Redis: Publishes chat message to group room "dm_UserA__UserB"
    ServerWS-->>Redis: Publishes notification toast to group "notifications_UserB"
    deactivate ServerWS
    
    activate Redis
    Redis-->>ClientA: Broadcasts "message" event to update chat window A
    Redis-->>ClientB: Broadcasts "message" event if active in room
    Redis-->>ClientB: Broadcasts "new_message_notification" toast if browsing other pages
    deactivate Redis
```

### 2. Scheduled Background Task Execution

Delayed posts leverage Celery and Redis to process and publish content at a specified time:

```mermaid
sequenceDiagram
    autonumber
    actor User as User Frontend
    participant DRF as Django REST API
    participant DB as PostgreSQL
    participant Celery as Celery worker
    
    User->>DRF: POST /api/tweets/ { "content": "Scheduled Post", "scheduled_at": "2026-05-30T10:00:00Z" }
    activate DRF
    DRF->>DB: Saves Tweet object (is_published=False)
    DRF->>Celery: Registers task 'publish_scheduled_tweet' with countdown/eta
    DRF-->>User: Returns 201 Created (Pending State)
    deactivate DRF

    Note over Celery: Execution scheduled time reached...
    activate Celery
    Celery->>DB: Fetches Tweet (pk=id, is_published=False)
    Celery->>DB: Updates is_published=True, saves record
    Celery->>User: Feed is updated with new post
    deactivate Celery
```

---

## Database Architecture (Entity Relationship Diagram)

This schema represents the PostgreSQL database layout and references:

```mermaid
erDiagram
    User ||--o{ Tweet : "author"
    User ||--o{ Like : "user"
    User ||--o{ PollVote : "user"
    User ||--o{ Message : "sender / receiver"
    User ||--o{ Notification : "recipient / sender"
    User }o--o{ User : "following / followers"
    
    Tweet ||--o{ Like : "tweet"
    Tweet ||--o{ TweetImage : "images"
    Tweet ||--|| Poll : "poll"
    
    Poll ||--o{ PollOption : "options"
    PollOption ||--o{ PollVote : "votes"
    
    User {
        int id PK
        string username
        string email
        string first_name
        string bio
        string avatar
        string banner
        boolean is_active
    }

    Tweet {
        int id PK
        int author_id FK
        string content
        string location
        datetime scheduled_at
        boolean is_published
        datetime created_at
    }

    Like {
        int id PK
        int user_id FK
        int tweet_id FK
        datetime created_at
    }

    TweetImage {
        int id PK
        int tweet_id FK
        string image
    }

    Poll {
        int id PK
        int tweet_id FK
        int duration_hours
        datetime ends_at
    }

    PollOption {
        int id PK
        int poll_id FK
        string text
        int order
    }

    PollVote {
        int id PK
        int option_id FK
        int user_id FK
        datetime created_at
    }

    Message {
        int id PK
        int sender_id FK
        int receiver_id FK
        text content
        datetime created_at
        boolean is_read
    }

    Notification {
        int id PK
        int recipient_id FK
        int sender_id FK
        string notification_type
        int tweet_id FK
        boolean is_read
        datetime created_at
    }
```

---

## Core API Documentation

All API requests must contain the `Authorization: Bearer <access_token>` header, except for registration and login endpoints.

### Authentication Service

| Endpoint | Method | Payload | Success Response (200/201) | Description |
|:---|:---|:---|:---|:---|
| `/api/users/register/` | `POST` | `{ "username": "...", "password": "...", "email": "..." }` | `{ "id": 1, "username": "..." }` | Registers a new user account on the platform. |
| `/api/users/login/` | `POST` | `{ "username": "...", "password": "..." }` | `{ "refresh": "...", "access": "..." }` | Authenticates credentials and returns a pair of JWT tokens. |
| `/api/users/token/refresh/` | `POST` | `{ "refresh": "..." }` | `{ "access": "..." }` | Generates a new short-lived access token using a valid refresh token. |
| `/api/users/me/` | `GET` | *None* | `{ "id": 1, "username": "...", "email": "..." }` | Retrieves profile details for the authenticated user. |

### Social Connection Service

| Endpoint | Method | Payload | Success Response (200) | Description |
|:---|:---|:---|:---|:---|
| `/api/users/<username>/` | `GET` | *None* | `{ "username": "...", "followers_count": X }` | Retrieves user profile metadata and social metrics. |
| `/api/users/<username>/follow/` | `POST` | *None* | `{ "status": "followed" / "unfollowed" }` | Toggles social connection state for the target profile. |
| `/api/users/<username>/followers/` | `GET` | *None* | `[{ "id": 1, "username": "..." }]` | Returns follower profiles for the specified user. |
| `/api/users/<username>/following/` | `GET` | *None* | `[{ "id": 2, "username": "..." }]` | Returns followed profiles for the specified user. |

### Posts & Interactions Service

| Endpoint | Method | Payload | Success Response (200/201) | Description |
|:---|:---|:---|:---|:---|
| `/api/tweets/` | `GET` | *None* | `[{ "id": 1, "content": "..." }]` | Fetches a global feed of published tweets. |
| `/api/tweets/` | `POST` | Multipart/Form `(content, image, poll_options)` | `{ "id": 2, "content": "..." }` | Publishes a new tweet with optional media, location, or polls. |
| `/api/tweets/feed/` | `GET` | *None* | `[{ "id": 3, "content": "..." }]` | Fetches a personalized feed containing posts from followed users. |
| `/api/tweets/<id>/` | `GET` | *None* | `{ "id": 4, "content": "..." }` | Retrieves a specific tweet and its replies. |
| `/api/tweets/<id>/` | `DELETE` | *None* | `{ "success": true }` | Deletes a tweet (restricted to the tweet author). |
| `/api/tweets/<id>/like/` | `POST` | *None* | `{ "liked": true / false }` | Toggles user like status on a tweet. |
| `/api/tweets/poll/vote/<option_id>/` | `POST` | *None* | `{ "success": true }` | Registers a vote for the specified poll option. |
| `/api/tweets/trending/` | `GET` | *None* | `[{ "tag": "#tag", "count": 15 }]` | Retrieves currently trending hashtags. |
| `/api/tweets/generate-caption/` | `POST` | `{ "hint": "Write about code" }` | `{ "caption": "Generated caption text" }` | Generates a post caption using OpenRouter AI. |

### Messaging & Notifications Service

| Endpoint | Method | Payload | Success Response (200) | Description |
|:---|:---|:---|:---|:---|
| `/api/chat/conversations/` | `GET` | *None* | `[{ "other_user": "...", "last_message": "..." }]` | Retrieves all active conversation threads for the user. |
| `/api/chat/search-users/?q=<query>` | `GET` | *None* | `[{ "username": "..." }]` | Searches database for users to start a chat thread with. |
| `/api/notifications/` | `GET` | *None* | `[{ "id": 1, "notification_type": "like" }]` | Returns a list of notifications for the user. |
| `/api/notifications/unread/` | `GET` | *None* | `{ "unread_count": 5 }` | Returns the number of unread notifications. |
| `/api/notifications/mark-read/` | `POST` | *None* | `{ "success": true }` | Marks all notifications as read. |

---

## Local Setup & Development Guidelines

### Prerequisites
*   Python 3.10+
*   Node.js 18+ & npm
*   PostgreSQL Database
*   Redis In-Memory Database Server

### 1. Database Server Configuration
Ensure PostgreSQL is active and create a database named `chatox`:
```sql
CREATE DATABASE chatox;
```

Ensure the Redis service is running locally:
```bash
# Ubuntu/Debian environment
sudo service redis-server start

# macOS environment
brew services start redis

# Verify connection
redis-cli ping
# Expected output: PONG
```

### 2. Backend Installation & Migration
Navigate to the backend directory and configure the environment:
```bash
cd backend
python -m venv env

# Activate virtual environment
# Windows:
.\env\Scripts\activate
# Linux/macOS:
source env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder and configure database credentials, Cloudinary, and OpenRouter APIs:
```env
DEBUG=True
SECRET_KEY=your_django_secret_key
DATABASE_URL=postgres://username:password@localhost:5432/chatox
REDIS_URL=redis://127.0.0.1:6379/1
OPENROUTER_API_KEY=your_openrouter_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Apply database migrations and start the Django development server:
```bash
python manage.py migrate
python manage.py runserver
```

### 3. Background Asynchronous Workers
With the virtual environment active in a separate terminal window, start the Celery worker process:
```bash
celery -A chatox worker --loglevel=info
```

### 4. Frontend Installation & Initialization
In a separate terminal, navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

Start the Vite compilation server:
```bash
npm run dev
```

Open your browser and navigate to the local URL (typically `http://localhost:5173`) to access the platform.
