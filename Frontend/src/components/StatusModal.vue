<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Change Work Order Status</h3>
        <button @click="emit('close')" class="btn-close">&times;</button>
      </div>

      <div class="modal-body">
        <div class="current-status">
          <label>Current Status</label>
          <span class="status-badge" :class="`status-${workOrder.status.toLowerCase()}`">
            {{ formatStatus(workOrder.status) }}
          </span>
        </div>

        <div class="form-group">
          <label for="newStatus">New Status *</label>
          <select id="newStatus" v-model="newStatus" required>
            <option value="">Select new status</option>
            <option
              v-for="status in availableStatuses"
              :key="status"
              :value="status"
            >
              {{ formatStatus(status) }}
            </option>
          </select>
        </div>

        <div class="info-box">
          <strong>Valid transitions:</strong>
          <ul>
            <li>PENDING → APPROVED or REJECTED</li>
            <li>APPROVED → IN_PROGRESS</li>
            <li>IN_PROGRESS → COMPLETED</li>
            <li>Any status → REJECTED (Admin/Manager only)</li>
          </ul>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            @click="handleSubmit"
            class="btn-submit"
            :disabled="!newStatus || loading"
          >
            {{ loading ? 'Updating...' : 'Update Status' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useWorkOrderStore } from '../stores/workOrder';

const props = defineProps({
  workOrder: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'save']);

const workOrderStore = useWorkOrderStore();

const newStatus = ref('');
const loading = ref(false);
const error = ref(null);

const statusTransitions = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['COMPLETED', 'REJECTED'],
  COMPLETED: ['REJECTED'],
  REJECTED: [],
};

const availableStatuses = computed(() => {
  return statusTransitions[props.workOrder.status] || [];
});

function formatStatus(status) {
  return status.replace(/_/g, ' ');
}

async function handleSubmit() {
  if (!newStatus.value) return;

  try {
    loading.value = true;
    error.value = null;
    await workOrderStore.updateWorkOrderStatus(props.workOrder.id, newStatus.value);
    emit('save');
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update status';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
}

.current-status {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.current-status label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.info-box {
  padding: 16px;
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.info-box strong {
  display: block;
  margin-bottom: 8px;
  color: #1e40af;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
  color: #1e40af;
}

.info-box li {
  margin-bottom: 4px;
}

.error-message {
  padding: 12px;
  background-color: #fee;
  color: #c33;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background-color: #e8e8e8;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
