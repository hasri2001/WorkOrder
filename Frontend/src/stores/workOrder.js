import { defineStore } from 'pinia';
import { ref } from 'vue';
import { workOrderAPI } from '../services/api';

export const useWorkOrderStore = defineStore('workOrder', () => {
  const workOrders = ref([]);
  const currentWorkOrder = ref(null);
  const logs = ref([]);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 20,
  });
  const loading = ref(false);
  const error = ref(null);

  // Actions
  async function fetchWorkOrders(filters = {}) {
    try {
      loading.value = true;
      error.value = null;
      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters,
      };
      const response = await workOrderAPI.getAll(params);
      workOrders.value = response.data.items;
      pagination.value.total = response.data.total;
      pagination.value.page = response.data.page;
      pagination.value.limit = response.data.limit;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch work orders';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchWorkOrder(id) {
    try {
      loading.value = true;
      error.value = null;
      const response = await workOrderAPI.getOne(id);
      currentWorkOrder.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch work order';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createWorkOrder(data) {
    try {
      loading.value = true;
      error.value = null;
      const response = await workOrderAPI.create(data);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create work order';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateWorkOrder(id, data) {
    try {
      loading.value = true;
      error.value = null;
      const response = await workOrderAPI.update(id, data);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update work order';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateWorkOrderStatus(id, newStatus) {
    try {
      loading.value = true;
      error.value = null;
      const response = await workOrderAPI.updateStatus(id, newStatus);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update status';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteWorkOrder(id) {
    try {
      loading.value = true;
      error.value = null;
      await workOrderAPI.delete(id);
      workOrders.value = workOrders.value.filter((wo) => wo.id !== id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete work order';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchLogs(id) {
    try {
      loading.value = true;
      error.value = null;
      const response = await workOrderAPI.getLogs(id);
      logs.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch logs';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function setPage(page) {
    pagination.value.page = page;
  }

  function setLimit(limit) {
    pagination.value.limit = limit;
    pagination.value.page = 1; // Reset to first page
  }

  return {
    workOrders,
    currentWorkOrder,
    logs,
    pagination,
    loading,
    error,
    fetchWorkOrders,
    fetchWorkOrder,
    createWorkOrder,
    updateWorkOrder,
    updateWorkOrderStatus,
    deleteWorkOrder,
    fetchLogs,
    setPage,
    setLimit,
  };
});
