<template>
  <div class="table-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading work orders...</p>
    </div>

    <div v-else-if="workOrders.length === 0" class="empty-state">
      <p>No work orders found</p>
    </div>

    <template v-else>
      <div class="table-wrapper">
        <table class="work-orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Created By</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="workOrder in workOrders" :key="workOrder.id">
              <td>{{ workOrder.id }}</td>
              <td>
                <div class="title-cell">
                  <strong>{{ workOrder.title }}</strong>
                  <small>{{ truncate(workOrder.description, 60) }}</small>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="`status-${workOrder.status.toLowerCase()}`">
                  {{ formatStatus(workOrder.status) }}
                </span>
              </td>
              <td>
                <span class="priority-badge" :class="`priority-${workOrder.priority.toLowerCase()}`">
                  {{ workOrder.priority }}
                </span>
              </td>
              <td>{{ workOrder.assignedTo?.name || 'Unassigned' }}</td>
              <td>{{ workOrder.createdBy?.name || '-' }}</td>
              <td>{{ formatDate(workOrder.dueDate) }}</td>
              <td>
                <div class="actions">
                  <button
                    v-if="canEdit"
                    @click="emit('edit', workOrder)"
                    class="btn-action btn-edit"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    @click="emit('change-status', workOrder)"
                    class="btn-action btn-status"
                    title="Change Status"
                  >
                    Status
                  </button>
                  <button
                    v-if="canViewLogs"
                    @click="emit('view-logs', workOrder)"
                    class="btn-action btn-logs"
                    title="View Logs"
                  >
                    Logs
                  </button>
                  <button
                    v-if="canDelete"
                    @click="emit('delete', workOrder)"
                    class="btn-action btn-delete"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <div class="pagination-info">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
          {{ pagination.total }} work orders
        </div>
        <div class="pagination-controls">
          <button
            @click="emit('page-change', pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="btn-page"
          >
            Previous
          </button>
          <span class="page-number">Page {{ pagination.page }} of {{ totalPages }}</span>
          <button
            @click="emit('page-change', pagination.page + 1)"
            :disabled="pagination.page === totalPages"
            class="btn-page"
          >
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  workOrders: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['edit', 'delete', 'change-status', 'view-logs', 'page-change']);

const authStore = useAuthStore();

const canEdit = computed(() => authStore.canEditWorkOrder);
const canDelete = computed(() => authStore.canDeleteWorkOrder);
const canViewLogs = computed(() => authStore.isAdmin || authStore.isManager);

const totalPages = computed(() =>
  Math.ceil(props.pagination.total / props.pagination.limit)
);

function formatStatus(status) {
  return status.replace(/_/g, ' ');
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function truncate(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #666;
}

.table-wrapper {
  overflow-x: auto;
}

.work-orders-table {
  width: 100%;
  border-collapse: collapse;
}

.work-orders-table th,
.work-orders-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.work-orders-table th {
  background-color: #f9fafb;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  color: #666;
}

.work-orders-table tbody tr:hover {
  background-color: #f9fafb;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-cell small {
  color: #666;
  font-size: 12px;
}

.status-badge,
.priority-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-approved {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-in_progress {
  background-color: #e0e7ff;
  color: #4338ca;
}

.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.priority-low {
  background-color: #f0f9ff;
  color: #0369a1;
}

.priority-medium {
  background-color: #fef3c7;
  color: #92400e;
}

.priority-high {
  background-color: #fee2e2;
  color: #991b1b;
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  font-weight: 500;
}

.btn-action:hover {
  opacity: 0.8;
}

.btn-edit {
  background-color: #eff6ff;
  color: #1e40af;
}

.btn-status {
  background-color: #f0fdf4;
  color: #15803d;
}

.btn-logs {
  background-color: #fef3c7;
  color: #92400e;
}

.btn-delete {
  background-color: #fee2e2;
  color: #991b1b;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #f9fafb;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-page {
  padding: 6px 12px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-page:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
</style>
