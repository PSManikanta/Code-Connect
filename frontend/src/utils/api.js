const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text || `HTTP ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      let errMsg = 'Something went wrong';
      if (typeof data.error === 'string') {
        errMsg = data.error;
      } else if (Array.isArray(data.error) && data.error[0]?.message) {
        errMsg = data.error[0].message;
      }
      throw new Error(errMsg);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to backend server. Please ensure backend is running.');
    }
    throw error;
  }
};
