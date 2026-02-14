<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Work Order Management</h1>
      <p class="subtitle">Sign in to continue</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            :disabled="authStore.loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            :disabled="authStore.loading"
          />
        </div>
        
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>
        
        <button type="submit" class="btn-login" :disabled="authStore.loading">
          {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      
      <div class="demo-accounts">
        <p class="demo-title">Demo Accounts:</p>
        <div class="demo-grid">
          <button @click="fillDemo('admin')" class="demo-btn">Admin</button>
          <button @click="fillDemo('manager')" class="demo-btn">Manager</button>
          <button @click="fillDemo('operator')" class="demo-btn">Operator</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const demoAccounts = {
  admin: { email: 'admin@example.com', password: 'Admin123!' },
  manager: { email: 'manager@example.com', password: 'Manager123!' },
  operator: { email: 'operator@example.com', password: 'Operator123!' },
};

function fillDemo(role) {
  email.value = demoAccounts[role].email;
  password.value = demoAccounts[role].password;
}

async function handleLogin() {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/');
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 420px;
  width: 100%;
}

h1 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 28px;
  text-align: center;
}

.subtitle {
  margin: 0 0 32px 0;
  color: #666;
  text-align: center;
  font-size: 14px;
}

.login-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background-color: #fee;
  color: #c33;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.3s;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-accounts {
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
}

.demo-title {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 13px;
  text-align: center;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.demo-btn {
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-btn:hover {
  background: #e8e8e8;
}
</style>
