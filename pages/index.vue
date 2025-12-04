<script setup lang="ts">
import { toast } from "vue-sonner";

definePageMeta({
  middleware: ["auth"],
});
const { signIn, loading } = useAuth();
const router = useRouter();
const { get } = useApi();
import type { Department, Position } from "~/types/model";
import { useQuery } from "@tanstack/vue-query";
import { useApi } from "~/composables/useApi";

const departments = ref<Department[]>([]);
const positions = ref<Position[]>([]);
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
});
const email = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    await signIn(email.value, password.value);
    email.value = "";
    password.value = "";
    toast.success("Амжилттай нэвтэрлээ");
    await router.push("/dashboard");
  } catch (err: any) {
    console.error("Login failed:", err);
    toast.error("Нэвтрэх нэр , нууц үгээ шалгана уу");
  }
};
// const openCreatePage = async () => {
//   try {
//     await router.push("/users?create=true");
//   } catch (error) {
//     console.error("Navigation failed:", error);
//   }
// };
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">HR Management System</h1>
        <p class="mt-2 text-sm text-gray-600">Sign in to your account</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-8">
        <h2 class="text-xl font-semibold mb-6 text-center">Login</h2>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <div v-if="loading" class="text-center">
            <div class="text-gray-600">Signing in...</div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? "Signing in..." : "Sign in" }}
          </button>
          <!-- <button
            @click="openCreatePage"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create account
          </button> -->
        </form>

        <div class="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 class="text-sm font-medium text-gray-900 mb-2">
            Demo Credentials:
          </h3>
          <div class="text-xs text-gray-600 space-y-1">
            <!-- <div>Email: admin@mail.com</div>
            <div>Password: 123456</div> -->
            <div>Email: user1@mail.com</div>
            <div>Password: 123456</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
