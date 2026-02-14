<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Audit Logs</h3>
        <button @click="emit('close')" class="btn-close">&times;</button>
      </div>

      <div class="modal-body">
        <div class="work-order-info">
          <h4>{{ workOrder.title }}</h4>
          <p>{{ workOrder.description }}</p>
        </div>

        <div v-if="logs.length === 0" class="empty-state">
          No logs found for this work order.
        </div>

        <div v-else class="logs-timeline">
          <div v-for="log in logs" :key="log.id" class="log-entry">
            <div class="log-icon" :class="`action-${log.action.toLowerCase()}`">
              {{ getActionIcon(log.action) }}
            </div>
            <div class="log-content">
              <div class="log-header">
                <span class="log-action">{{ formatAction(log.action) }}</span>
                <span class="log-time">{{ formatDateTime(log.timestamp) }}</span>
              </div>
              <div class="log-details">
                <span class="log-user">{{ log.performedBy?.name || 'Unknown' }}</span>
                <span v-if="log.fromStatus || log.toStatus" class="log-status-change">
                  <span v-if="log.fromStatus" class="status-from">{{ formatStatus(log.fromStatus) }}</span>
                  <span v-if="log.fromStatus && log.toStatus">→</span>
                  <span v-if="log.toStatus" class="status-to">{{ formatStatus(log.toStatus) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="btn-close-modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  workOrder: {
    type: Object,
    required: true,
  },
  logs: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['close']);

function getActionIcon(action) {
  const icons = {
    CREATE: '➕',
    UPDATE: '✏️',
    STATUS_CHANGE: '🔄',
    DELETE: '🗑️',
  };
  return icons[action] || '•';
}

function formatAction(action) {
  return action.replace(/_/g, ' ');
}

function formatStatus(status) {
  return status.replace(/_/g, ' ');
}

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
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

.work-order-info {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.work-order-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.work-order-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.logs-timeline {
  position: relative;
  padding-left: 40px;
}

.logs-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
}

.log-entry {
  position: relative;
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.log-icon {
  position: absolute;
  left: -40px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background-color: white;
  border: 2px solid;
  z-index: 1;
}

.action-create {
  border-color: #10b981;
  color: #10b981;
}

.action-update {
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-status_change {
  border-color: #f59e0b;
  color: #f59e0b;
}

.action-delete {
  border-color: #ef4444;
  color: #ef4444;
}

.log-content {
  flex: 1;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-action {
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  font-size: 13px;
}

.log-time {
  font-size: 12px;
  color: #666;
}

.log-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.log-user {
  color: #666;
}

.log-status-change {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background-color: white;
  border-radius: 4px;
  font-size: 12px;
}

.status-from {
  color: #ef4444;
  font-weight: 500;
}

.status-to {
  color: #10b981;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-close-modal {
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-close-modal:hover {
  background-color: #e8e8e8;
}
</style>
