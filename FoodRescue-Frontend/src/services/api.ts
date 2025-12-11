import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('food_rescue_user');
  },
};

// Foods API
export const foodsAPI = {
  getAll: async () => {
    const response = await api.get('/foods');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/foods/${id}`);
    return response.data;
  },

  create: async (foodData: any, imageFile?: File) => {
    const formData = new FormData();
    
    // Append all food data
    Object.keys(foodData).forEach(key => {
      formData.append(key, foodData[key]);
    });
    
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await api.post('/foods', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, foodData: any) => {
    const response = await api.put(`/foods/${id}`, foodData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/foods/${id}`);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getMyOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  create: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },
};

export default api;
