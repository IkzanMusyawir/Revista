const { protocol, hostname, port } = window.location;
export const API_BASE = import.meta.env.VITE_API_URL || (['3000', '5173'].includes(port) ? `${protocol}//${hostname}:3001` : '');
