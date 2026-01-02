const isLocalhost = window.location.hostname === 'localhost';

export const API_BASE = isLocalhost
  ? 'http://localhost:5000'
  : 'https://eba1e4c6c6a8.ngrok-free.app'; // ← URL de ngrok del backend