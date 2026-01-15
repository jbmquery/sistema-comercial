const isLocalhost = window.location.hostname === 'localhost';

export const API_BASE = isLocalhost
  ? 'http://localhost:5000'
  : 'https://lucienne-preadministrative-odelia.ngrok-free.dev'; // ← URL de ngrok del backend