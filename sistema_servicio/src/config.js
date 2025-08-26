const isLocalhost = window.location.hostname === 'localhost';

export const API_BASE = isLocalhost
  ? 'http://localhost:5000'
  : 'https://d99032507b32.ngrok-free.app'; // ← URL de ngrok del backend