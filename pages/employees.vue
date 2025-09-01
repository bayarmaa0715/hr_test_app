<script setup lang="ts">
definePageMeta({
  layout: "main",
  middleware: "auth",
});

import { ref, computed, watch } from "vue";
import { useMutation, useQueryClient, useQuery } from "@tanstack/vue-query";
import EmployeeFormModal from "~/components/Employees/EmployeeFormModal.vue";
import DeleteModal from "~/components/Employees/DeleteModal.vue";
import { PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { useApi } from "~/composables/useApi";
import { useRBAC } from "~/composables/useRBAC";
import type {
  Department,
  Employee,
  Location,
  Position,
  UserProfile,
} from "~/types/model";
const { permissions, canManageEmployees, currentRole, isEmployee } = useRBAC();

const users = ref<UserProfile[]>([]);
const positions = ref<Position[]>([]);
const locations = ref<Location[]>([]);
const employees = ref<Employee[]>([]);

const { post, get, put, delete: del } = useApi();
const queryClient = useQueryClient();

const positionsQuery = useQuery({
  queryKey: ["positions"],
  queryFn: async () => {
    const res: Position[] = await get("/api/positions");
    console.log("positions", res);
    return res;
  },
});

const locationsQuery = useQuery({
  queryKey: ["locations"],
  queryFn: async () => {
    const res: Location[] = await get("/api/locations");
    console.log("locations", res);
    return res;
  },
});

const employeesQuery = useQuery({
  queryKey: ["employeesWithUserProfiles"],
  queryFn: async () => {
    const res: { employees: Employee[]; userProfiles: UserProfile[] } =
      await get("/api/employees");

    return res;
  },
});

watch(
  () => employeesQuery.data.value,
  (data) => {
    if (data) {
      employees.value = data.employees;
      users.value = data.userProfiles;
    }
  },
  { immediate: true }
);

watch(
  () => positionsQuery.data.value,
  (data) => {
    if (data) {
      positions.value = data;
    }
  },
  { immediate: true }
);

watch(
  () => locationsQuery.data.value,
  (data) => {
    if (data) {
      locations.value = data;
    }
  },
  { immediate: true }
);

watch(
  () => employeesQuery.error.value,
  (error) => {
    if (error) {
      console.error("Error fetching employees:", error);
    }
  }
);

const createEmployeeMutation = useMutation({
  mutationFn: async (payload: {
    user: Partial<UserProfile>;
    employee: Partial<Employee>;
  }) => {
    return await post<{ user: UserProfile; employee: Employee }>(
      "/api/employees",
      payload
    );
  },
  onSuccess: (data) => {
    console.log("Employee created successfully:", data);
    queryClient.invalidateQueries({ queryKey: ["employeesWithUserProfiles"] });
    editingEmployee.value = null;
    editingUser.value = null;
    // users.value.push(data.user);
    // employees.value.push(data.employee);
    showForm.value = false;
  },
  onError: (error) => {
    console.error("Create employee error:", error);
  },
});

const updateEmployeeMutation = useMutation({
  mutationFn: async (payload: {
    employeeId: string;
    userData?: Partial<UserProfile>;
    employeeData?: Partial<Employee>;
  }) => {
    return await put<{ user: UserProfile; employee: Employee }>(
      "/api/employees",
      payload
    );
  },
  onSuccess: (data) => {
    console.log("Employee updated successfully:", data);
    queryClient.invalidateQueries({ queryKey: ["employeesWithUserProfiles"] });
    editingEmployee.value = null;
    editingUser.value = null;
    showForm.value = false;
  },
  onError: (error) => {
    console.error("Update employee error:", error);
  },
});

const showForm = ref(false);
const editingEmployee = ref<Employee | null>(null);
const showDeleteModal = ref(false);
const deletingEmployee = ref<Employee | null>(null);
const editingUser = ref<UserProfile | null>(null);

const addEmployee = () => {
  editingEmployee.value = null;
  editingUser.value = null;
  showForm.value = true;
};

const editEmployee = (emp: Employee) => {
  editingEmployee.value = emp;
  editingUser.value =
    users.value.find((u) => u.id === emp.userProfileId) || null;
  showForm.value = true;
};
const saveEmployee = (payload: { user: UserProfile; employee?: Employee }) => {
  const emp = payload.employee;
  console.log("payload user4", payload.user);
  console.log("emp", emp);
  if (emp && emp.id && employees.value.some((e) => e.id === emp.id)) {
    console.log("Updating employee");
    updateEmployeeMutation.mutate({
      employeeId: emp.id,
      userData: payload.user,
      employeeData: emp,
    });
  } else {
    console.log("New employee");
    createEmployeeMutation.mutate({
      user: payload.user,
      employee: emp || {
        positionId: "",
        locationId: "",
        hireDate: new Date(),
        salary: 0,
        isActive: true,
      },
    });
  }
};

const confirmDelete = (emp: Employee) => {
  deletingEmployee.value = emp;
  showDeleteModal.value = true;
};
const deleteEmployeeMutation = useMutation({
  mutationFn: (employeeId: string) => del("/api/employees", { employeeId }),
  onSuccess: (data) => {
    console.log("Delete employee success:", data);
    queryClient.invalidateQueries({ queryKey: ["employeesWithUserProfiles"] });
  },
  onError: (error) => {
    console.error("Delete employee error:", error);
  },
});

// Initialize test data mutation
const initDataMutation = useMutation({
  mutationFn: () => post("/api/init-data"),
  onSuccess: (data) => {
    console.log("Test data initialized successfully:", data);
    // Invalidate all queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["employeesWithUserProfiles"] });
    queryClient.invalidateQueries({ queryKey: ["positions"] });
    queryClient.invalidateQueries({ queryKey: ["locations"] });
  },
  onError: (error) => {
    console.error("Failed to initialize test data:", error);
  },
});
const deleteEmployeeConfirmed = () => {
  if (!deletingEmployee.value) return;
  deleteEmployeeMutation.mutate(deletingEmployee.value.id);
  deletingEmployee.value = null;
  showDeleteModal.value = false;
};

const getUser = (id: string) => users.value.find((u) => u.id === id);
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Employees</h1>
      <div class="flex gap-2">
        <button
          @click="initDataMutation.mutate()"
          :disabled="initDataMutation.isPending.value"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{
            initDataMutation.isPending.value
              ? "Initializing..."
              : "Init Test Data"
          }}
        </button>
        <button
          v-if="permissions.canCreate"
          @click="addEmployee"
          :disabled="
            createEmployeeMutation.isPending.value ||
            updateEmployeeMutation.isPending.value
          "
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{
            createEmployeeMutation.isPending.value ||
            updateEmployeeMutation.isPending.value
              ? "Processing..."
              : "Add Employee"
          }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="border rounded-lg shadow overflow-hidden">
      <div class="overflow-auto">
        <table class="w-full divide-y divide-gray-200 table-fixed">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-24"
              >
                Name
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-32"
              >
                Email
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-20"
              >
                Role
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-24"
              >
                Position
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-24"
              >
                Department
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-24"
              >
                Location
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-24"
              >
                Hire Date
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-20"
              >
                Salary
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-20"
              >
                Status
              </th>
              <th
                class="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase whitespace-nowrap w-24"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="emp in employees" :key="emp.id" class="hover:bg-gray-50">
              <td class="px-4 py-4 truncate">
                {{ getUser(emp.userProfileId)?.firstName }}
                {{ getUser(emp.userProfileId)?.lastName }}
              </td>
              <td class="px-4 py-4 truncate">
                {{ getUser(emp.userProfileId)?.email }}
              </td>
              <td class="px-4 py-4 truncate">
                {{ getUser(emp.userProfileId)?.role }}
              </td>
              <td class="px-4 py-4 truncate">
                {{
                  positions.find((p) => p.id === emp.positionId)?.name || "-"
                }}
              </td>
              <td class="px-4 py-4 truncate">
                <!-- {{
                departments.find((d) => d.id === emp.departmentId)?.name || "-"
              }} -->
                departmentId.name
              </td>
              <td class="px-4 py-4 truncate">
                {{
                  locations.find((l) => l.id === emp.locationId)?.city || "-"
                }}
              </td>
              <td class="px-4 py-4 truncate">
                {{ new Date(emp.hireDate).toLocaleDateString() }}
              </td>
              <td class="px-4 py-4 truncate">{{ emp.salary }}</td>
              <td class="px-4 py-4">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs',
                    emp.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ emp.isActive ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="px-4 py-4 text-center space-x-2 flex justify-center">
                <!-- Edit Icon -->
                <button
                  v-if="permissions.canUpdate"
                  @click="editEmployee(emp)"
                  class="text-blue-600 hover:text-blue-900 p-1 rounded"
                >
                  <PencilIcon class="h-5 w-5" />
                </button>

                <!-- Delete Icon -->
                <button
                  v-if="permissions.canDelete"
                  @click="confirmDelete(emp)"
                  class="text-red-600 hover:text-red-900 p-1 rounded"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
                <span
                  v-if="
                    isEmployee &&
                    !permissions.canUpdate &&
                    !permissions.canDelete
                  "
                  class="text-gray-500 text-sm"
                >
                  View Only
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Employee Add/Edit Modal -->
    <EmployeeFormModal
      :show="showForm"
      :user="editingUser"
      :employee="editingEmployee"
      :locations="locations"
      :positions="positions"
      @close="showForm = false"
      @save="saveEmployee"
    />

    <!-- Delete Modal -->
    <DeleteModal
      :show="showDeleteModal"
      :deletingItem="deletingEmployee"
      @close="showDeleteModal = false"
      @confirm="deleteEmployeeConfirmed"
    />
  </div>
</template>
