# Chatox Frontend

React + Vite frontend for the Chatox (Twitter clone) backend.

## Stack
- React 18 + React Router v6
- Zustand (auth state)
- Axios (API calls, JWT refresh interceptor)
- date-fns (relative timestamps)
- CSS Modules (scoped styles)
- DM Sans + DM Mono (Google Fonts)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure API URL
cp .env.example .env
# Edit .env — in dev the Vite proxy forwards /api → localhost:8000

# 3. Start dev server
npm run dev
```

Make sure your Django backend is running on `http://localhost:8000` with CORS allowing `http://localhost:5173`.

## CORS (Django backend)
```python
# settings.py
INSTALLED_APPS += ['corsheaders']
MIDDLEWARE.insert(0, 'corsheaders.middleware.CorsMiddleware')
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
```

## Project Structure
```
src/
  api/
    client.js          # Axios instance + JWT interceptors + all API calls
  context/
    authStore.js       # Zustand store for auth state
  components/
    Layout.jsx         # Shell with sidebar + <Outlet>
    TweetCard.jsx      # Reusable tweet card (like, delete, navigate)
    ComposeBox.jsx     # Post composer with char counter
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    FeedPage.jsx       # /  → personalized feed
    ProfilePage.jsx    # /:username
    TweetDetailPage.jsx# /:username/status/:pk
    ExplorePage.jsx    # /explore → all tweets + search
    NotificationsPage.jsx
    SettingsPage.jsx   # edit profile
```

## API Field Assumptions
The frontend assumes these field names from your backend. Adjust in `TweetCard.jsx` / pages if yours differ:

| Field | Expected |
|-------|----------|
| Tweet author | `tweet.author.username` |
| Tweet content | `tweet.content` |
| Tweet timestamp | `tweet.created_at` |
| Like count | `tweet.likes_count` |
| Is liked | `tweet.is_liked` |
| Follow status | `profile.is_following` |
| Follower count | `profile.followers_count` |
| Following count | `profile.following_count` |

## Building for Production
```bash
npm run build
# Output in dist/
```
