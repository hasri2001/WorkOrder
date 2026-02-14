import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role);
  const isAdmin = computed(() => userRole.value === 'ADMIN');
  const isManager = computed(() => userRole.value === 'MANAGER');
  const isOperator = computed(() => userRole.value === 'OPERATOR');
  const canCreateWorkOrder = computed(() => isAdmin.value || isManager.value);
  const canEditWorkOrder = computed(() => isAdmin.value || isManager.value);
  const canDeleteWorkOrder = computed(() => isAdmin.value || isManager.value);

  // Actions
  function initAuth() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
    }
  }

  async function login(email, password) {
    try {
      loading.value = true;
      error.value = null;
      const response = await authAPI.login(email, password);
      const { accessToken, user: userData } = response.data;
      
      token.value = accessToken;
      user.value = userData;
      
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    isAdmin,
    isManager,
    isOperator,
    canCreateWorkOrder,
    canEditWorkOrder,
    canDeleteWorkOrder,
    initAuth,
    login,
    logout,
  };
});
