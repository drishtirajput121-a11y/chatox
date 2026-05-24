import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: BASE_URL,
})

/* Attach access token to every request */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* Auto-refresh on 401 */
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        isRefreshing = false
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/users/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        api.defaults.headers.common.Authorization = `Bearer ${data.access}`
        processQueue(null, data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

/* --- Auth --- */
export const authAPI = {
  register: (data) => api.post('/users/register/', data),
  login: (data) => api.post('/users/login/', data),
}

/* --- Users --- */
export const usersAPI = {
  me: () => api.get('/users/me/'),
  updateMe: (data) => api.patch('/users/me/', data),
  getProfile: (username) => api.get(`/users/${username}/`),
  toggleFollow: (username) => api.post(`/users/${username}/follow/`),
}

/* --- Tweets --- */
export const tweetsAPI = {
  feed: () => api.get('/tweets/feed/'),
  list: (username) => api.get('/tweets/', { params: username ? { username } : {} }),
  get: (pk) => api.get(`/tweets/${pk}/`),
  create: (data) => api.post('/tweets/', data),
  votePoll: (optionId) => api.post(`/tweets/poll/vote/${optionId}/`),
  delete: (pk) => api.delete(`/tweets/${pk}/`),
  toggleLike: (pk) => api.post(`/tweets/${pk}/like/`),
}

export default api