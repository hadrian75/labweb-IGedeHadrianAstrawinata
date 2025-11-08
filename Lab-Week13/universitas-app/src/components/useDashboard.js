
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';


export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to parse user data:', err);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, tokens) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh
      });
      localStorage.setItem('access_token', response.data.access);
      return response.data.access;
    } catch (err) {
      logout();
      throw err;
    }
  };

  return { user, loading, error, login, logout, refreshToken };
};

// ============================================
// 2. useAPI Hook - Generic API Fetching
// ============================================

export const useAPI = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => fetchData();

  return { data, loading, error, refetch };
};

// ============================================
// 3. useMatakuliah Hook - Mata Kuliah Management
// ============================================

export const useMatakuliah = (role, userEmail) => {
  const { data, loading, error, refetch } = useAPI('/academic/matakuliah/');

  const filteredMatakuliah = data
    ? role === 'DOSEN'
      ? data.filter(mk => mk.pengajar?.some(p => p.email === userEmail))
      : data
    : [];

  const getMatakuliahByKode = (kode) => {
    return filteredMatakuliah.find(mk => mk.kode_mk === kode);
  };

  const totalSKS = filteredMatakuliah.reduce((sum, mk) => sum + (mk.sks || 0), 0);

  return {
    matakuliah: filteredMatakuliah,
    totalMatakuliah: filteredMatakuliah.length,
    totalSKS,
    loading,
    error,
    refetch,
    getMatakuliahByKode
  };
};

// ============================================
// 4. useNilaiAkhir Hook - Final Grades Management
// ============================================

export const useNilaiAkhir = () => {
  const { data, loading, error, refetch } = useAPI('/academic/nilai-akhir/');

  const calculateIPK = () => {
    if (!data || data.length === 0) return 0;

    const gradePoints = {
      'A': 4.0, 'AB': 3.5, 'B': 3.0,
      'BC': 2.5, 'C': 2.0, 'D': 1.0, 'E': 0.0
    };

    const total = data.reduce((sum, nilai) => {
      return sum + (gradePoints[nilai.nilai_huruf] || 0);
    }, 0);

    return (total / data.length).toFixed(2);
  };

  const getNilaiByMatakuliah = (kode_mk) => {
    return data?.find(nilai => nilai.matakuliah === kode_mk);
  };

  const gradesBreakdown = () => {
    if (!data) return {};

    return data.reduce((acc, nilai) => {
      const grade = nilai.nilai_huruf;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});
  };

  return {
    nilaiAkhir: data || [],
    loading,
    error,
    refetch,
    ipk: calculateIPK(),
    getNilaiByMatakuliah,
    gradesBreakdown: gradesBreakdown()
  };
};

// ============================================
// 5. useAssessment Hook - Assessment Management
// ============================================

export const useAssessment = (matakuliahKode = null) => {
  const endpoint = matakuliahKode
    ? `/academic/assessment/?matakuliah_kode_mk=${matakuliahKode}`
    : '/academic/assessment/';

  const { data, loading, error, refetch } = useAPI(endpoint);

  const createAssessment = async (assessmentData) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_BASE_URL}/academic/assessment/`,
        assessmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refetch();
      return { success: true, data: response.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to create assessment'
      };
    }
  };

  const updateAssessment = async (id, assessmentData) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(
        `${API_BASE_URL}/academic/assessment/${id}/`,
        assessmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refetch();
      return { success: true, data: response.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to update assessment'
      };
    }
  };

  const deleteAssessment = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE_URL}/academic/assessment/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refetch();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to delete assessment'
      };
    }
  };

  return {
    assessments: data || [],
    loading,
    error,
    refetch,
    createAssessment,
    updateAssessment,
    deleteAssessment
  };
};

// ============================================
// 6. useKomponenNilai Hook - Grade Components
// ============================================

export const useKomponenNilai = () => {
  const { data, loading, error, refetch } = useAPI('/academic/komponen/');

  const getKomponenByMatakuliah = (kode_mk) => {
    return data?.filter(komponen => komponen.matakuliah === kode_mk) || [];
  };

  const validateBobotTotal = (komponenList) => {
    const total = komponenList.reduce((sum, k) => sum + parseFloat(k.bobot_persen || 0), 0);
    return Math.abs(total - 100) < 0.01; // Allow small floating point errors
  };

  const createKomponen = async (komponenData) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_BASE_URL}/academic/komponen/`,
        komponenData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refetch();
      return { success: true, data: response.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to create komponen'
      };
    }
  };

  return {
    komponenNilai: data || [],
    loading,
    error,
    refetch,
    getKomponenByMatakuliah,
    validateBobotTotal,
    createKomponen
  };
};

// ============================================
// 7. useJurusan Hook - Department Management
// ============================================

export const useJurusan = () => {
  const { data, loading, error, refetch } = useAPI('/academic/jurusan/');

  const getJurusanByKode = (kode) => {
    return data?.find(jurusan => jurusan.kode === kode);
  };

  return {
    jurusan: data || [],
    loading,
    error,
    refetch,
    getJurusanByKode
  };
};

// ============================================
// 8. useLocalStorage Hook - Persistent State
// ============================================

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// ============================================
// 9. useDebounce Hook - Debounced Values
// ============================================

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ============================================
// 10. useNotification Hook - Toast Messages
// ============================================

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const success = (message, duration) => addNotification(message, 'success', duration);
  const error = (message, duration) => addNotification(message, 'error', duration);
  const warning = (message, duration) => addNotification(message, 'warning', duration);
  const info = (message, duration) => addNotification(message, 'info', duration);

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };
};

// ============================================
// 11. useToggle Hook - Boolean State Toggle
// ============================================

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
};

// ============================================
// 12. usePagination Hook - Table Pagination
// ============================================

export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  const currentData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

// ============================================
// 13. useSort Hook - Data Sorting
// ============================================

export const useSort = (data, initialKey = null, initialDirection = 'asc') => {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDirection, setSortDirection] = useState(initialDirection);

  const sortedData = [...(data || [])].sort((a, b) => {
    if (!sortKey) return 0;

    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort
  };
};

// ============================================
// 14. useFilter Hook - Data Filtering
// ============================================

export const useFilter = (data, filterFn) => {
  const [filters, setFilters] = useState({});

  const filteredData = data?.filter(item => {
    if (filterFn) {
      return filterFn(item, filters);
    }
    return true;
  }) || [];

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    filteredData,
    filters,
    updateFilter,
    clearFilters
  };
};


export default {
  useAuth,
  useAPI,
  useMatakuliah,
  useNilaiAkhir,
  useAssessment,
  useKomponenNilai,
  useJurusan,
  useLocalStorage,
  useDebounce,
  useNotification,
  useToggle,
  usePagination,
  useSort,
  useFilter
};