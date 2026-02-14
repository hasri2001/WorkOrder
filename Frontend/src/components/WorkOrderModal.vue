<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>{{ mode === 'create' ? 'Create Work Order' : 'Edit Work Order' }}</h3>
        <button @click="emit('close')" class="btn-close">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="title">Title *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            placeholder="Enter work order title"
          />
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            v-model="form.description"
            required
            rows="4"
            placeholder="Enter detailed description"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="priority">Priority *</label>
            <select id="priority" v-model="form.priority" required>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div class="form-group">
            <label for="assignedToUserId">Assigned To</label>
            <select id="assignedToUserId" v-model="form.assignedToUserId">
              <option :value="null">Unassigned</option>
              <!-- In a real app, you'd fetch users from API -->
              <option value="1">Admin User</option>
              <option value="2">Manager User</option>
              <option value="3">Operator User</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="dueDate">Due Date</label>
          <input
            id="dueDate"
            v-model="form.dueDate"
            type="date"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWorkOrderStore } from '../stores/workOrder';

const props = defineProps({
  workOrder: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'create', // 'create' or 'edit'
  },
});

const emit = defineEmits(['close', 'save']);

const workOrderStore = useWorkOrderStore();

const form = ref({
  title: '',
  description: '',
  priority: 'MEDIUM',
  assignedToUserId: null,
  dueDate: '',
});

const loading = ref(false);
const error = ref(null);

onMounted(() => {
  if (props.mode === 'edit' && props.workOrder) {
    form.value = {
      title: props.workOrder.title,
      description: props.workOrder.description,
      priority: props.workOrder.priority,
      assignedToUserId: props.workOrder.assignedTo?.id || null,
      dueDate: props.workOrder.dueDate
        ? new Date(props.workOrder.dueDate).toISOString().split('T')[0]
        : '',
    };
  }
});

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = null;

    const data = {
      ...form.value,
      dueDate: form.value.dueDate || null,
    };

    if (props.mode === 'create') {
      await workOrderStore.createWorkOrder(data);
    } else {
      await workOrderStore.updateWorkOrder(props.workOrder.id, data);
    }

    emit('save');
  } catch (err) {
    error.value = err.response?.data?.message || 'Operation failed';
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
  max-width: 600px;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
