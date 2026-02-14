<template>
  <div class="filters-card">
    <div class="filters-grid">
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Priority</label>
        <select v-model="filters.priority" @change="applyFilters">
          <option value="">All</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Search</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search title or description..."
          @input="debouncedFilter"
        />
      </div>

      <div class="filter-actions">
        <button @click="resetFilters" class="btn-reset">Reset</button>
        <button @click="applyFilters" class="btn-apply">Apply</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['filter', 'reset']);

const filters = ref({
  status: '',
  priority: '',
  search: '',
});

let debounceTimer = null;

function applyFilters() {
  const activeFilters = {};
  if (filters.value.status) activeFilters.status = filters.value.status;
  if (filters.value.priority) activeFilters.priority = filters.value.priority;
  if (filters.value.search) activeFilters.search = filters.value.search;
  
  emit('filter', activeFilters);
}

function debouncedFilter() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    applyFilters();
  }, 500);
}

function resetFilters() {
  filters.value = {
    status: '',
    priority: '',
    search: '',
  };
  emit('reset');
}
</script>

<style scoped>
.filters-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.btn-reset,
.btn-apply {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  border: none;
}

.btn-reset {
  background-color: #f5f5f5;
  color: #333;
}

.btn-reset:hover {
  background-color: #e8e8e8;
}

.btn-apply {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-apply:hover {
  opacity: 0.9;
}
</style>
