import API from './index';

export const AlertsAPI = {
    list: () => API.get('/api/alerts').then(r => r.data),
    create: (payload) => API.post('/api/alerts', payload).then(r => r.data),
    update: (id, payload) => API.put(`/api/alerts/${id}`, payload).then(r => r.data),
    remove: (id) => API.delete(`/api/alerts/${id}`).then(r => r.data),
    events: (page = 1, pageSize = 20) => API.get(`/api/alerts/events?page=${page}&pageSize=${pageSize}`).then(r => r.data)
};

export const InsightsAPI = {
    summary: () => API.get('/api/insights/summary').then(r => r.data),
    underpriced: (qs = '') => API.get(`/api/insights/underpriced${qs ? `?${qs}` : ''}`).then(r => r.data),
    matchmaking: () => API.get('/api/insights/matchmaking').then(r => r.data)
};
