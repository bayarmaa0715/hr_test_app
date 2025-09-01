<script setup lang="ts">
definePageMeta({
  layout: "main",
  middleware: "auth",
});

import { ref, onMounted, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import type { Department, Position } from "~/types/model";
import { useQuery } from "@tanstack/vue-query";
import { useApi } from "~/composables/useApi";

const departments = ref<Department[]>([]);
const employees = ref<any[]>([]);

const { get } = useApi();

useQuery({
  queryKey: ["departmentsWithPositions"],
  queryFn: async () => {
    const res: { departments: Department[]; positions: Position[] } = await get(
      "/api/departments"
    );
    console.log("res", res);

    departments.value = res.departments || [];

    return res;
  },
});

// Fetch employees data
useQuery({
  queryKey: ["employeesWithUserProfiles"],
  queryFn: async () => {
    const res: { employees: any[]; userProfiles: any[] } = await get(
      "/api/employees"
    );
    console.log("employees res", res);

    employees.value = res.employees || [];
    return res;
  },
});

const { user, loading } = useAuth();
const router = useRouter();

const employeeCount = ref(0);
const departmentCount = ref(0);
const userRole = ref("User");
const recentActivity = ref<any[]>([]);

const navigateTo = (path: string) => router.push(path);

// Watch for departments data changes
watch(
  () => departments.value,
  (newDepartments) => {
    departmentCount.value = newDepartments.length;
    console.log("departmentCount", departmentCount.value);
  },
  { immediate: true }
);

// Watch for employees data changes
watch(
  () => employees.value,
  (newEmployees) => {
    employeeCount.value = newEmployees.length;
    console.log("employeeCount", employeeCount.value);
  },
  { immediate: true }
);

onMounted(() => {
  userRole.value = user.value?.email?.includes("admin") ? "Admin" : "User";

  recentActivity.value = [
    {
      id: 1,
      icon: "👤",
      title: "New employee added",
      description: "John Doe joined the Engineering team",
      time: "2 hours ago",
    },
    {
      id: 2,
      icon: "📝",
      title: "Department updated",
      description: "Marketing department details updated",
      time: "1 day ago",
    },
  ];
});
</script>

<template>
  <!-- flex-1 + min-h-0 чухал -->
  <div class="flex-1 min-h-0 space-y-8">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Employees</h3>
        <p class="text-3xl font-bold text-blue-600">{{ employeeCount }}</p>
        <p class="text-sm text-gray-600">Total employees</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Departments</h3>
        <p class="text-3xl font-bold text-green-600">{{ departmentCount }}</p>
        <p class="text-sm text-gray-600">Active departments</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">User Role</h3>
        <p class="text-3xl font-bold text-purple-600">{{ userRole }}</p>
        <p class="text-sm text-gray-600">Your access level</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          @click="navigateTo('/employees')"
          class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
        >
          <div class="text-blue-600 text-2xl mb-2">👥</div>
          <h4 class="font-semibold text-gray-900">Manage Employees</h4>
          <p class="text-sm text-gray-600">View and edit employee data</p>
        </button>
        <button
          @click="navigateTo('/departments')"
          class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
        >
          <div class="text-green-600 text-2xl mb-2">🏢</div>
          <h4 class="font-semibold text-gray-900">Departments</h4>
          <p class="text-sm text-gray-600">Manage departments</p>
        </button>
        <button
          @click="navigateTo('/weather')"
          class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
        >
          <div class="text-purple-600 text-2xl mb-2">📊</div>
          <h4 class="font-semibold text-gray-900">Weather</h4>
          <p class="text-sm text-gray-600">
            Show weather for employee locations
          </p>
        </button>
        <button
          @click="navigateTo('/users')"
          class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
        >
          <div class="text-gray-600 text-2xl mb-2">⚙️</div>
          <h4 class="font-semibold text-gray-900">Authentication</h4>
          <p class="text-sm text-gray-600">Manage authentication</p>
        </button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div class="p-6 space-y-4">
        <div
          v-for="activity in recentActivity"
          :key="activity.id"
          class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
        >
          <div class="text-blue-600 text-xl">{{ activity.icon }}</div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ activity.title }}</p>
            <p class="text-sm text-gray-600">{{ activity.description }}</p>
          </div>
          <div class="text-sm text-gray-500">{{ activity.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
