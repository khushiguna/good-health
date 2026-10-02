/**
 * Good Health and Well-Being - Backend API Client
 */

const API_BASE = window.location.origin;

const getHeaders = () => {
    const token = localStorage.getItem('gh_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};


  async function fetchWithAuth(url, options) {
    const fetchFn = (typeof window !== 'undefined' && window.fetch) ? window.fetch : fetch;
    const res = await fetchFn(url, options);
    if (res.status === 401) {
        if (localStorage.getItem('gh_token')) {
            localStorage.removeItem('gh_token');
            localStorage.removeItem('gh_user');
            window.location.reload();
        }
    }
    return res;
  }

const HealthAPI = {
  async checkHealth() {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/health-check`);
      return await res.json();
    } catch (err) {
      return { status: 'OFFLINE', error: err.message };
    }
  },

  async getTasks(conditionKey) {
    try {
      const q = (conditionKey && conditionKey !== 'all') ? `?conditionKey=${conditionKey}` : '?conditionKey=all';
      const res = await fetchWithAuth(`${API_BASE}/api/tasks${q}`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data.tasks : null;
    } catch (e) { console.error('API FETCH ERROR:', e); return null; }
  },

  async getSuggestions(conditionKey, category) {
    try {
        let url = `${API_BASE}/api/tasks/suggestions?condition=${conditionKey || 'general'}`;
        if (category) url += `&category=${category}`;
        const res = await fetchWithAuth(url, { headers: getHeaders() });
        const data = await res.json();
        return data.success ? data.tasks : null;
    } catch (e) { console.error('API FETCH ERROR:', e); return null; }
  },

  async createTask(task) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task)
      });
      return await res.json();
    } catch (e) { console.error('API FETCH ERROR:', e); return null; }
  },

  async updateTask(id, task) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/tasks/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(task)
      });
      return await res.json();
    } catch (e) { console.error('API FETCH ERROR:', e); return null; }
  },

  async deleteTask(id) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/tasks/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    } catch (e) { console.error('API FETCH ERROR:', e); return null; }
  },

  async toggleCompletion(taskId, status, conditionKey, logDate, category) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/tasks/toggle-completion`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ taskId, date: logDate, status, conditionKey, category })
      });
      return await res.json();
    } catch (e) { console.error('API FETCH ERROR:', e); return null; }
  },

  async getCompletions(conditionKey, date, category) {
    try {
      const params = new URLSearchParams({ date });
      if (conditionKey) params.append('conditionKey', conditionKey);
      if (category) params.append('category', category);
      
      const res = await fetchWithAuth(`${API_BASE}/api/tasks/completions?${params.toString()}`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data.completions : null;
    } catch (e) { console.error('API FETCH ERROR:', e); return null; }
  },
  
  async getWeeklyReport(weekStart) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/tasks/weekly-report?weekStart=${weekStart}`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data : null;
    } catch(e) { return null; }
  },
  
  async getCalendarHistory(days) {
      try {
          const res = await fetchWithAuth(`${API_BASE}/api/tasks/calendar?days=${days||30}`, { headers: getHeaders() });
          const data = await res.json();
          return data.success ? data.history : null;
      } catch(e) { return null; }
  },

  async getCalendarMonth(year, month, category, conditionKey) {
      try {
          const params = new URLSearchParams({ year, month });
          if (category && category !== 'all') params.append('category', category);
          if (conditionKey && conditionKey !== 'all') params.append('conditionKey', conditionKey);
          const res = await fetchWithAuth(`${API_BASE}/api/tasks/calendar?${params.toString()}`, { headers: getHeaders() });
          const data = await res.json();
          return data.success ? data.history : null;
      } catch(e) { return null; }
  },

  async getCalendarDay(date, conditionKey, category) {
      try {
          const params = new URLSearchParams({ date });
          if (conditionKey && conditionKey !== 'all') params.append('conditionKey', conditionKey);
          if (category && category !== 'all') params.append('category', category);
          const res = await fetchWithAuth(`${API_BASE}/api/tasks/calendar-day?${params.toString()}`, { headers: getHeaders() });
          const data = await res.json();
          return data.success ? data : null;
      } catch(e) { return null; }
  },

  async getCategoryPreferences() {
      try {
          const res = await fetchWithAuth(`${API_BASE}/api/tasks/preferences`, { headers: getHeaders() });
          const data = await res.json();
          return data.success ? data.categories : null;
      } catch(e) { return null; }
  },

  async saveCategoryPreferences(categories) {
      try {
          const res = await fetchWithAuth(`${API_BASE}/api/tasks/preferences`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({ categories })
          });
          const data = await res.json();
          return data.success ? data.categories : null;
      } catch(e) { return null; }
  },
  
  async getStreak() {
      try {
          const res = await fetchWithAuth(`${API_BASE}/api/tasks/streak`, { headers: getHeaders() });
          const data = await res.json();
          return data.success ? data : null;
      } catch(e) { return null; }
  },

  async dailyReset(conditionKey) {
      try {
          const res = await fetchWithAuth(`${API_BASE}/api/tasks/daily-reset`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({ conditionKey })
          });
          return await res.json();
      } catch (e) { console.error('API FETCH ERROR:', e); return null; }
  },

  async login(email, password) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await res.json();
    } catch (e) { return { success: false, error: 'Network error communicating with auth server' }; }
  },

  async register(name, email, password) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      return await res.json();
    } catch (e) { return { success: false, error: 'Network error communicating with auth server' }; }
  },
  
  async getMe() {
      try {
          const res = await fetchWithAuth(`${API_BASE}/api/auth/me`, { headers: getHeaders() });
          return await res.json();
      } catch (e) { return { success: false }; }
  },

  async submitFeedback(data) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) { return { status: 'error', message: e.message }; }
  }
};

window.HealthAPI = HealthAPI;
