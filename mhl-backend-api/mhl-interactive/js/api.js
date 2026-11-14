const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Ошибка сервера (${response.status})`);
  return data;
}

export const api = {
  getMatches: () => request('/matches'),
  getTeams: () => request('/teams'),
  getFavorites: () => request('/favorites'),
  addFavorite: (teamId) => request('/favorites', { method: 'POST', body: JSON.stringify({ teamId }) }),
  removeFavorite: (teamId) => request(`/favorites/${encodeURIComponent(teamId)}`, { method: 'DELETE' }),
  createOrder: (order) => request('/orders', { method: 'POST', body: JSON.stringify(order) }),
  sendSupport: (message) => request('/support', { method: 'POST', body: JSON.stringify({ message }) })
};
