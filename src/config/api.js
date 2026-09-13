// Centralized API configuration for PRAGATI
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== 'http://localhost:8000')
    ? import.meta.env.VITE_API_BASE_URL
    : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
      ? 'https://gordon-nested-difficulty-personality.trycloudflare.com'
      : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');
