let authToken = localStorage.getItem('backend_jwt') || '';

export function setAuthToken(token) {
  authToken = token || '';
  if (authToken) {
    localStorage.setItem('backend_jwt', authToken);
  } else {
    localStorage.removeItem('backend_jwt');
  }
}

export function getAuthToken() {
  return authToken;
}

const API_BASE = process.env.REACT_APP_BACKEND_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload?.data;
}

export const api = {
  clerkLogin: (clerkToken) => request('/auth/clerk/login', { method: 'POST', body: JSON.stringify({ clerkToken }) }),
  getUser: (id) => request(`/users/${id}`),
  searchUsers: (q) => request(`/users/search?q=${encodeURIComponent(q)}`),
  getFriends: () => request('/friends'),
  getFriendRequests: () => request('/friends/requests'),
  sendFriendRequest: (receiverId) => request('/friends/request', { method: 'POST', body: JSON.stringify({ receiverId }) }),
  acceptFriendRequest: (requestId) => request(`/friends/${requestId}/accept`, { method: 'POST' }),
  rejectFriendRequest: (requestId) => request(`/friends/${requestId}/reject`, { method: 'POST' }),
  unfriend: (friendId) => request(`/friends/${friendId}`, { method: 'DELETE' }),
  getConversations: () => request('/conversations'),
  deleteConversation: (conversationId) => request(`/conversations/${conversationId}`, { method: 'DELETE' }),
  getNotifications: (cursor, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    if (limit) params.set('limit', String(limit));
    const qs = params.toString();
    return request(`/notifications${qs ? `?${qs}` : ''}`);
  },
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
  getMessages: (conversationId, cursor, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    if (limit) params.set('limit', String(limit));
    const qs = params.toString();
    return request(`/messages/${conversationId}${qs ? `?${qs}` : ''}`);
  },
  searchMessages: (conversationId, q, cursor, limit = 20) => {
    const params = new URLSearchParams();
    params.set('q', q);
    if (cursor) params.set('cursor', cursor);
    if (limit) params.set('limit', String(limit));
    return request(`/messages/${conversationId}/search?${params.toString()}`);
  }
};
