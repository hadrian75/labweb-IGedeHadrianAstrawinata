import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

const api = {
  get: (url, config = {}) => {
    const token = getAuthToken();
    return axios.get(`${API_BASE_URL}${url}`, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  },

  post: (url, data, config = {}) => {
    const token = getAuthToken();
    return axios.post(`${API_BASE_URL}${url}`, data, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  },

  put: (url, data, config = {}) => {
    const token = getAuthToken();
    return axios.put(`${API_BASE_URL}${url}`, data, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  },

  delete: (url, config = {}) => {
    const token = getAuthToken();
    return axios.delete(`${API_BASE_URL}${url}`, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  },
};

export default api;