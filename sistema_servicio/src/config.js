const isLocalhost = window.location.hostname === 'localhost';

export const API_BASE = isLocalhost
  ? 'http://localhost:5000'
  : 'https://abd6ac201af5.ngrok-free.app'; // ← URL de ngrok del backend