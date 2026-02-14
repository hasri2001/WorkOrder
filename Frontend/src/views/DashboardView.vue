<template>
  <div class="dashboard">
    <header class="header">
      <div class="header-content">
        <h1>Work Order Management</h1>
        <div class="user-info">
          <span class="user-name">{{ authStore.user?.name }}</span>
          <span class="user-role" :class="`role-${authStore.userRole?.toLowerCase()}`">
            {{ authStore.userRole }}
          </span>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-header">
        <h2>Work Orders</h2>
        <button
          v-if="authStore.canCreateWorkOrder"
          @click="openCreateModal"
          class="btn-primary"
        >
          + Create Work Order
        </button>
      </div>

      <WorkOrderFilters @filter="handleFilter" @reset="handleResetFilters" />

      <div v-if="workOrderStore.error" class="error-banner">
        {{ workOrderStore.error }}
      </div>

      <WorkOrderTable
        :work-orders="workOrderStore.workOrders"
        :loading="workOrderStore.loading"
        :pagination="workOrderStore.pagination"
        @edit="openEditModal"
        @delete="handleDelete"
        @change-status="openStatusModal"
        @view-logs="openLogsModal"
        @page-change="handlePageChange"
      />
    </main>

    <WorkOrderModal
      v-if="showModal"
      :work-order="selectedWorkOrder"
      :mode="modalMode"
      @close="closeModal"
      @save="handleSave"
    />

    <StatusModal
      v-if="showStatusModal"
      :work-order="selectedWorkOrder"
      @close="closeStatusModal"
      @save="handleStatusChange"
    />

    <LogsModal
      v-if="showLogsModal"
      :work-order="selectedWorkOrder"
      :logs="workOrderStore.logs"
      @close="closeLogsModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useWorkOrderStore } from '../stores/workOrder';
import WorkOrderFilters from '../components/WorkOrderFilters.vue';
import WorkOrderTable from '../components/WorkOrderTable.vue';
import WorkOrderModal from '../components/WorkOrderModal.vue';
import StatusModal from '../components/StatusModal.vue';
import LogsModal from '../components/LogsModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();

const showModal = ref(false);
const showStatusModal = ref(false);
const showLogsModal = ref(false);
const selectedWorkOrder = ref(null);
const modalMode = ref('create'); // 'create' or 'edit'
const currentFilters = ref({});

onMounted(() => {
  loadWorkOrders();
});

async function loadWorkOrders() {
  try {
    await workOrderStore.fetchWorkOrders(currentFilters.value);
  } catch (error) {
    console.error('Failed to load work orders:', error);
  }
}

function handleFilter(filters) {
  currentFilters.value = filters;
  workOrderStore.setPage(1);
  loadWorkOrders();
}

function handleResetFilters() {
  currentFilters.value = {};
  workOrderStore.setPage(1);
  loadWorkOrders();
}

function handlePageChange(page) {
  workOrderStore.setPage(page);
  loadWorkOrders();
}

function openCreateModal() {
  selectedWorkOrder.value = null;
  modalMode.value = 'create';
  showModal.value = true;
}

function openEditModal(workOrder) {
  selectedWorkOrder.value = workOrder;
  modalMode.value = 'edit';
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedWorkOrder.value = null;
}

async function handleSave() {
  closeModal();
  await loadWorkOrders();
}

async function handleDelete(workOrder) {
  if (!confirm(`Are you sure you want to delete "${workOrder.title}"?`)) {
    return;
  }
  
  try {
    await workOrderStore.deleteWorkOrder(workOrder.id);
    await loadWorkOrders();
  } catch (error) {
    alert(`Failed to delete work order: ${error.response?.data?.message || error.message}`);
  }
}

function openStatusModal(workOrder) {
  selectedWorkOrder.value = workOrder;
  showStatusModal.value = true;
}

function closeStatusModal() {
  showStatusModal.value = false;
  selectedWorkOrder.value = null;
}

async function handleStatusChange() {
  closeStatusModal();
  await loadWorkOrders();
}

async function openLogsModal(workOrder) {
  selectedWorkOrder.value = workOrder;
  try {
    await workOrderStore.fetchLogs(workOrder.id);
    showLogsModal.value = true;
  } catch (error) {
    alert(`Failed to load logs: ${error.response?.data?.message || error.message}`);
  }
}

function closeLogsModal() {
  showLogsModal.value = false;
  selectedWorkOrder.value = null;
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-role {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background-color: #fee;
  color: #c33;
}

.role-manager {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.role-operator {
  background-color: #f0fdf4;
  color: #15803d;
}

.btn-logout {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-logout:hover {
  background-color: #e8e8e8;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.error-banner {
  padding: 12px 16px;
  background-color: #fee;
  color: #c33;
  border-radius: 8px;
  margin-bottom: 16px;
}
</style>
