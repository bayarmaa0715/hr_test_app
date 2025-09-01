<template>
  <div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label
          for="password"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your password"
        />
      </div>

      <div
        v-if="error"
        class="p-3 bg-red-100 border border-red-400 text-red-700 rounded"
      >
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">Loading...</span>
        <span v-else>Login</span>
      </button>
    </form>

    <div class="mt-4 text-center">
      <p class="text-sm text-gray-600">
        Don't have an account?
        <button
          @click="$emit('switch-to-signup')"
          class="text-blue-600 hover:text-blue-800 font-medium"
        >
          Sign up
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const { signIn, loading, error } = useAuth();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    await signIn(email.value, password.value);
    // Redirect or emit success event
    console.log("Login successful");
  } catch (err) {
    console.error("Login failed:", err);
  }
};

defineEmits<{
  "switch-to-signup": [];
}>();
</script>
