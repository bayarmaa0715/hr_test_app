<script setup lang="ts">
definePageMeta({
  layout: "main",
  middleware: "auth",
});
import { ref, computed } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useApi } from "~/composables/useApi";
import type { Department, Position } from "~/types/model";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/vue/24/solid";

const { post, get, put, delete: del } = useApi();
const queryClient = useQueryClient();

useQuery({
  queryKey: ["departmentsWithPositions"],
  queryFn: async () => {
    const res: { departments: Department[]; positions: Position[] } = await get(
      "/api/departments"
    );

    departments.value = res.departments || [];
    positions.value = res.positions || [];
    return res;
  },
  retry: false,
  refetchOnWindowFocus: false,
  refetchInterval: false,
});

const showForm = ref(false);
const isEditMode = ref(false);
const editingItem = ref<any>({
  id: "",
  departmentId: "",
  newDepartmentName: "",
  positionId: "",
  newPositionName: "",
  description: "",
});
const addingNewDepartment = ref(false);
const addingNewPosition = ref(false);

const departments = ref<Department[]>([]);
const positions = ref<Position[]>([]);

const filteredPositions = computed(() => {
  return positions.value.filter(
    (p) => p.departmentId === editingItem.value.departmentId
  );
});

const createMutation = useMutation({
  mutationFn: (data: {
    department?: Partial<Department>;
    positions: Partial<Position>[];
  }) => post("/api/departments", data),
  onSuccess: (data) => {
    console.log("Create success:", data);
    queryClient.invalidateQueries({ queryKey: ["departmentsWithPositions"] });
    showForm.value = false;
    resetForm();
  },
  onError: (error) => {
    console.error("Create error:", error);
  },
});

const updateMutation = useMutation({
  mutationFn: (data: {
    department?: Partial<Department>;
    positions: Partial<Position>[];
  }) => put("/api/departments", data),
  onSuccess: (data) => {
    console.log("Update success:", data);
    queryClient.invalidateQueries({ queryKey: ["departmentsWithPositions"] });
    showForm.value = false;
    resetForm();
  },
  onError: (error) => {
    console.error("Update error:", error);
  },
});

const deletePositionMutation = useMutation({
  mutationFn: (positionId: string) =>
    del("/api/departments", { positionId: positionId }),
  onSuccess: (data) => {
    console.log("Delete position success:", data);
    queryClient.invalidateQueries({ queryKey: ["departmentsWithPositions"] });
  },
  onError: (error) => {
    console.error("Delete position error:", error);
  },
});

const openAddModal = () => {
  isEditMode.value = false;
  editingItem.value = {
    id: "",
    departmentId: "",
    newDepartmentName: "",
    positionId: "",
    newPositionName: "",
    description: "",
  };
  addingNewDepartment.value = false;
  addingNewPosition.value = false;
  showForm.value = true;
};

const openEditModal = (pos: Position) => {
  isEditMode.value = true;
  editingItem.value = {
    id: pos.id,
    departmentId: pos.departmentId,
    newDepartmentName: "",
    positionId: pos.id,
    newPositionName: pos.name,
    description: pos.description,
  };
  addingNewDepartment.value = false;
  addingNewPosition.value = false;
  showForm.value = true;
};

const resetForm = () => {
  editingItem.value = {
    id: "",
    departmentId: "",
    newDepartmentName: "",
    positionId: "",
    newPositionName: "",
    description: "",
  };
  addingNewDepartment.value = false;
  addingNewPosition.value = false;
  isEditMode.value = false;
};

const openAddDepartmentModal = () => {
  isEditMode.value = false;
  editingItem.value = {
    id: "",
    departmentId: "",
    newDepartmentName: "",
    positionId: "",
    newPositionName: "",
    description: "",
  };
  addingNewDepartment.value = true;
  addingNewPosition.value = false;
  showForm.value = true;
};

const openEditDepartmentModal = (dept: Department) => {
  isEditMode.value = true;
  editingItem.value = {
    id: dept.id,
    departmentId: dept.id,
    newDepartmentName: dept.name,
    positionId: "",
    newPositionName: "",
    description: "",
  };
  addingNewDepartment.value = true;
  addingNewPosition.value = false;
  showForm.value = true;
};

const saveItem = async () => {
  let departmentId = editingItem.value.departmentId;

  const departmentData =
    addingNewDepartment.value && editingItem.value.newDepartmentName
      ? {
          id: editingItem.value.id || undefined,
          name: editingItem.value.newDepartmentName,
        }
      : undefined;

  if (departmentData && !departmentData.id) {
    departmentId = "dep" + (departments.value.length + 1);
  } else if (departmentData) {
    departmentId = departmentData.id;
  }

  const positionData: Partial<Position> = {
    id: editingItem.value.id || undefined,
    name: editingItem.value.newPositionName || "",
    departmentId,
    description: editingItem.value.description || "",
  };
  console.log("departmentData", departmentData);
  console.log("positionData", positionData);

  const mutationData = {
    department: departmentData,
    positions: [positionData],
  };

  if (isEditMode.value) {
    updateMutation.mutate(mutationData);
  } else {
    createMutation.mutate(mutationData);
  }
};

const deletePosition = (pos: Position) => {
  if (confirm(`Are you sure you want to delete position "${pos.name}"?`)) {
    deletePositionMutation.mutate(pos.id);
  }
};

const getDepartmentName = (id: string) =>
  departments.value.find((d) => d.id === id)?.name || "-";
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Departments & Positions</h1>
      <div class="flex gap-3">
        <button
          @click="openAddDepartmentModal"
          class="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <PlusIcon class="h-5 w-5 mr-1" /> Add Department
        </button>
        <button
          @click="openAddModal"
          class="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <PlusIcon class="h-5 w-5 mr-1" /> Add Position
        </button>
      </div>
    </div>

    <table class="min-w-full divide-y divide-gray-200 border rounded-lg shadow">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">
            Department
          </th>
          <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">
            Position
          </th>
          <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">
            Description
          </th>
          <th class="px-6 py-3 text-center text-sm font-medium text-gray-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <!-- Department Rows (without positions) -->
        <tr
          v-for="dept in departments.filter(
            (d) => !positions.some((p) => p.departmentId === d.id)
          )"
          :key="`dept-${dept.id}`"
          class="hover:bg-gray-50 bg-blue-50"
        >
          <td class="px-6 py-4 font-medium">{{ dept.name }}</td>
          <td class="px-6 py-4 text-gray-500 italic">No positions</td>
          <td class="px-6 py-4 text-gray-500">-</td>
          <td class="px-6 py-4 flex justify-center space-x-2">
            <button
              @click="openEditDepartmentModal(dept)"
              class="text-blue-600 hover:text-blue-900 p-1 rounded"
              title="Edit Department"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
          </td>
        </tr>

        <!-- Position Rows -->
        <tr
          v-for="pos in positions"
          :key="`pos-${pos.id}`"
          class="hover:bg-gray-50"
        >
          <td class="px-6 py-4">{{ getDepartmentName(pos.departmentId) }}</td>
          <td class="px-6 py-4">{{ pos.name }}</td>
          <td class="px-6 py-4">{{ pos.description }}</td>
          <td class="px-6 py-4 flex justify-center space-x-2">
            <button
              @click="openEditModal(pos)"
              class="text-blue-600 hover:text-blue-900 p-1 rounded"
              title="Edit Position"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              @click="deletePosition(pos)"
              :disabled="deletePositionMutation.isPending.value"
              class="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Position"
            >
              <span v-if="deletePositionMutation.isPending.value" class="mr-1">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="none"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              <TrashIcon class="h-5 w-5" />
            </button>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-if="departments.length === 0 && positions.length === 0">
          <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500">
            No departments or positions found. Create your first items above.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <h2 class="text-xl font-semibold text-gray-800 mb-6 text-center">
          {{ isEditMode ? "Edit" : "Add" }}
          {{ addingNewDepartment ? "Department" : "Position" }}
        </h2>

        <!-- Department -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Department</label
          >
          <div class="flex space-x-2">
            <select
              v-if="!addingNewDepartment"
              v-model="editingItem.departmentId"
              class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select Department</option>
              <option v-for="d in departments" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>
            <input
              v-if="addingNewDepartment"
              v-model="editingItem.newDepartmentName"
              placeholder="New Department"
              class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="addingNewDepartment = !addingNewDepartment"
              class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              {{ addingNewDepartment ? "Cancel" : "+ New" }}
            </button>
          </div>
        </div>

        <!-- Position -->
        <div
          class="mb-4"
          v-if="editingItem.departmentId || addingNewDepartment"
        >
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Position</label
          >
          <div class="flex space-x-2">
            <select
              v-if="!addingNewPosition && filteredPositions.length"
              v-model="editingItem.positionId"
              class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Position</option>
              <option v-for="p in filteredPositions" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
            <input
              v-if="addingNewPosition || !filteredPositions.length"
              v-model="editingItem.newPositionName"
              placeholder="New Position"
              class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="addingNewPosition = !addingNewPosition"
              class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              {{ addingNewPosition ? "Cancel" : "+ New" }}
            </button>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Description</label
          >
          <textarea
            v-model="editingItem.description"
            rows="2"
            placeholder="Optional description"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showForm = false"
            class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </button>
          <button
            @click="saveItem"
            :disabled="
              createMutation.isPending.value || updateMutation.isPending.value
            "
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <span
              v-if="
                createMutation.isPending.value || updateMutation.isPending.value
              "
              class="mr-2"
            >
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ isEditMode ? "Update" : "Save" }}
          </button>
        </div>

        <!-- Close X -->
        <button
          @click="showForm = false"
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

title="Delete Position"
