<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { useApi } from "~/composables/useApi";
import { useAuth } from "~/composables/useAuth";

import type { UserProfile } from "~/types/model";

definePageMeta({
  layout: "main",
  middleware: "auth",
});

const { get, post, put } = useApi();
const { signUp } = useAuth();
const queryClient = useQueryClient();

// Form state
const showCreateForm = ref(false);

// Check URL parameters on mount
onMounted(() => {
  const route = useRoute();
  if (route.query.create === "true") {
    showCreateForm.value = true;
  }
});
const newUser = ref({
  email: "",
  password: "",
});

// Fetch user profiles
const userProfilesQuery = useQuery({
  queryKey: ["authedUsers"],
  queryFn: async () => {
    const res: { authedUsers: UserProfile[] } = await get("/api/auth/register");
    console.log("res", res);
    return res.authedUsers;
  },
});

const userProfiles = ref<UserProfile[]>([]);

watch(
  () => userProfilesQuery.data.value,
  (data) => {
    if (data) {
      userProfiles.value = data;
      console.log("userProfiles", userProfiles.value);
    }
  },
  { immediate: true }
);

// Create user mutation
const createUserMutation = useMutation({
  mutationFn: async (userData: typeof newUser.value) => {
    return await post("/api/auth/register", {
      email: userData.email,
      password: userData.password,
    });
  },
  onSuccess: () => {
    console.log("User created successfully");
    queryClient.invalidateQueries({ queryKey: ["authedUsers"] });
    showCreateForm.value = false;
    resetForm();
  },
  onError: (error) => {
    console.error("Error creating user:", error);
  },
});

const resetForm = () => {
  newUser.value = {
    email: "",
    password: "",
  };
};

const handleCreateUser = () => {
  if (!newUser.value.email || !newUser.value.password) {
    alert("Please fill in all required fields");
    return;
  }

  createUserMutation.mutate(newUser.value);
};
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">User Authentication</h1>
      <button
        @click="showCreateForm = true"
        :disabled="createUserMutation.isPending.value"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ createUserMutation.isPending.value ? "Creating..." : "Create User" }}
      </button>
    </div>

    <!-- Create User Form Modal -->
    <div
      v-if="showCreateForm"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Create New User</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              v-model="newUser.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              v-model="newUser.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-6">
          <button
            @click="
              showCreateForm = false;
              resetForm();
            "
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="handleCreateUser"
            :disabled="createUserMutation.isPending.value"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{
              createUserMutation.isPending.value ? "Creating..." : "Create User"
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="border rounded-lg shadow overflow-hidden">
      <div class="overflow-auto">
        <table class="w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase"
              >
                Name
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase"
              >
                Email
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase"
              >
                Role
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase"
              >
                Created
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in userProfiles"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-4">
                {{ user.firstName }} {{ user.lastName }}
              </td>
              <td class="px-4 py-4">
                {{ user.email }}
              </td>
              <td class="px-4 py-4">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : user.role === 'manager'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800',
                  ]"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-gray-500">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="userProfiles.length === 0 && !userProfilesQuery.isLoading.value"
      class="text-center py-8"
    >
      <div class="text-lg text-gray-600">No users found</div>
      <div class="text-sm text-gray-500 mt-2">
        Create your first user to get started
      </div>
    </div>
  </div>
</template>
