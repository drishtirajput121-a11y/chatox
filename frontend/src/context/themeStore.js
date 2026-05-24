import { create } from 'zustand'

const getSystemTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('chatox-theme') || 'dark',

  init: () => {
    const saved = localStorage.getItem('chatox-theme')
    const theme = saved || 'dark'
    applyTheme(theme)
    set({ theme })
  },

  setTheme: (theme) => {
    localStorage.setItem('chatox-theme', theme)
    applyTheme(theme)
    set({ theme })
  },

  toggle: () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    localStorage.setItem('chatox-theme', next)
    applyTheme(next)
    set({ theme: next })
  },
}))
