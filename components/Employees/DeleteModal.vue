<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { Employee } from "~/types/model";

interface Props {
  show: boolean;
  deletingItem: Employee | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const confirm = () => emit("confirm");
const cancel = () => emit("cancel");
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black/25 z-50"
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
      <h3 class="text-lg font-bold mb-4">Delete</h3>
      <p class="mb-4">
        Are you sure you want to delete
        <span class="font-semibold">{{ deletingItem }}</span
        >?
      </p>
      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          @click="cancel"
        >
          No
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          @click="confirm"
        >
          Yes
        </button>
      </div>
    </div>
  </div>
</template>
