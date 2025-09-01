<script setup lang="ts">
import { reactive, watch, defineProps, defineEmits } from "vue";
import type { Employee, Location, Position, UserProfile } from "~/types/model";

interface Props {
  show: boolean;
  employee?: Employee | null | undefined;
  user?: UserProfile | null;
  locations: Location[];
  positions: Position[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", payload: { user: UserProfile; employee?: Employee }): void;
}>();

// User form
const formUser = reactive<UserProfile>({
  id: "",
  uid: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "employee",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Employee form
const formEmployee = reactive<Employee>({
  id: "",
  userProfileId: "",
  positionId: "",
  hireDate: new Date(),
  salary: 0,
  locationId: "",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const editing = reactive({
  value: false,
});
console.log("user props", props);
// Sync props
watch(
  () => props.user,
  (newVal) => {
    if (newVal) Object.assign(formUser, newVal);
    else {
      formUser.id = "";
      formUser.uid = "";
      formUser.firstName = "";
      formUser.lastName = "";
      formUser.email = "";
      formUser.role = "employee";
      formUser.createdAt = new Date();
      formUser.updatedAt = new Date();
    }
  },
  { immediate: true }
);

watch(
  () => props.employee,
  (newVal) => {
    if (newVal) {
      Object.assign(formEmployee, newVal);
      formEmployee.userProfileId = props.user?.id || "";
      editing.value = true;
    } else {
      formEmployee.id = "";
      formEmployee.userProfileId = props.user?.id || "";
      formEmployee.positionId = "";
      formEmployee.hireDate = new Date();
      formEmployee.salary = 0;
      formEmployee.locationId = "";
      formEmployee.isActive = true;
      formEmployee.createdAt = new Date();
      formEmployee.updatedAt = new Date();
      editing.value = false;
    }
  },
  { immediate: true }
);

const submitForm = () => {
  formEmployee.updatedAt = new Date();
  formUser.updatedAt = new Date();
  if (!formUser.id) formUser.createdAt = new Date();
  if (!formEmployee.id) formEmployee.createdAt = new Date();
  emit("save", { user: { ...formUser }, employee: { ...formEmployee } });
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
  >
    <div
      class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md overflow-auto max-h-[90vh]"
    >
      <h3 class="text-xl font-bold mb-4">
        {{ editing.value ? "Edit" : "Add" }} User & Employee
      </h3>

      <div class="space-y-4">
        <!-- User -->
        <div class="border-b pb-4">
          <h4 class="font-semibold mb-2">User Info</h4>
          <input
            type="text"
            v-model="formUser.firstName"
            placeholder="First Name"
            class="w-full border px-3 py-2 rounded mb-2"
          />
          <input
            type="text"
            v-model="formUser.lastName"
            placeholder="Last Name"
            class="w-full border px-3 py-2 rounded mb-2"
          />
          <input
            type="email"
            v-model="formUser.email"
            placeholder="Email"
            class="w-full border px-3 py-2 rounded mb-2"
          />
          <select
            v-model="formUser.role"
            class="w-full border px-3 py-2 rounded"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <!-- Employee -->
        <div>
          <h4 class="font-semibold mb-2">Employee Info (Optional)</h4>
          <select
            v-model="formEmployee.positionId"
            class="w-full border px-3 py-2 rounded mb-2"
          >
            <option value="">Select Position</option>
            <option
              v-for="pos in props.positions"
              :key="pos.id"
              :value="pos.id"
            >
              {{ pos.name }}
            </option>
          </select>
          <input
            type="date"
            v-model="formEmployee.hireDate"
            class="w-full border px-3 py-2 rounded mb-2"
          />
          <input
            type="number"
            v-model="formEmployee.salary"
            placeholder="Salary"
            class="w-full border px-3 py-2 rounded mb-2"
          />
          <select
            v-model="formEmployee.locationId"
            class="w-full border px-3 py-2 rounded mb-2"
          >
            <option value="">Select Location</option>
            <option
              v-for="loc in props.locations"
              :key="loc.id"
              :value="loc.id"
            >
              {{ loc.city }}
            </option>
          </select>
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              v-model="formEmployee.isActive"
              id="isActive"
            />
            <label for="isActive">Active</label>
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          @click="submitForm"
        >
          {{ editing.value ? "Save" : "Create" }}
        </button>
      </div>
    </div>
  </div>
</template>
