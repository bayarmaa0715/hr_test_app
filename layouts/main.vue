<!-- layouts/main.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/vue/24/solid";
import { HomeIcon, UserIcon, CloudIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const { user, logout } = useAuth();
const showSidebar = ref(false);
const minimized = ref(false);

const handleLogout = async () => {
  try {
    await logout();
    await router.push("/");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

const navItems = [
  { name: "Dashboard", to: "/dashboard", icon: HomeIcon },
  { name: "Employees", to: "/employees", icon: UserIcon },
  { name: "Departments", to: "/departments", icon: UserIcon },
  { name: "Weather", to: "/weather", icon: CloudIcon },
  { name: "Authentication", to: "/users", icon: CloudIcon },
];
</script>

<template>
  <div class="flex min-h-screen bg-gray-5 w-screen">
    <!-- Sidebar overlay for mobile -->
    <div
      v-if="showSidebar"
      class="fixed inset-0 bg-black bg-opacity-40 z-40 sm:hidden"
      @click="showSidebar = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white shadow-lg flex flex-col p-4 sm:p-6 space-y-6 transition-all duration-300 z-50  ',
        showSidebar
          ? 'translate-x-0 fixed top-0 left-0 h-screen w-full sm:translate-x-0 sm:static sm:h-screen'
          : '-translate-x-full fixed top-0 left-0 h-screen w-full sm:translate-x-0 sm:static sm:h-screen',
        minimized ? 'sm:w-20' : 'sm:w-72',
      ]"
    >
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1
          class="text-2xl font-bold truncate transition-opacity duration-300"
          :class="minimized ? 'opacity-0 sm:opacity-100' : 'opacity-100'"
        >
          HR Dashboard
        </h1>
        <Button
          class="hidden sm:inline-flex p-1"
          variant="ghost"
          @click="minimized = !minimized"
        >
          <Bars3Icon class="w-6 h-6" />
        </Button>
        <Button
          v-if="showSidebar"
          variant="ghost"
          class="sm:hidden p-1"
          @click="showSidebar = false"
        >
          <XMarkIcon class="w-6 h-6" />
        </Button>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-col mt-6 gap-3">
        <Button
          v-for="item in navItems"
          :key="item.name"
          variant="ghost"
          class="justify-start text-left flex items-center gap-2 group"
          asChild
        >
          <NuxtLink
            :to="item.to"
            @click.native="showSidebar = false"
            class="flex items-center gap-2 w-full"
          >
            <component :is="item.icon" class="w-6 h-6" />
            <span
              class="transition-all duration-300 whitespace-nowrap"
              :class="
                minimized
                  ? 'opacity-0 group-hover:opacity-100 ml-2'
                  : 'opacity-100'
              "
            >
              {{ item.name }}
            </span>
          </NuxtLink>
        </Button>
      </nav>

      <!-- Footer -->
      <div class="mt-auto space-y-2" :class="minimized ? 'md:hidden' : ''">
        <Card class="p-4 shadow-sm bg-gray-50">
          <p
            class="text-sm text-gray-500"
            :class="minimized ? 'opacity-0' : 'opacity-100'"
          >
            Logged in as
          </p>
          <p
            class="font-medium text-gray-900 truncate transition-opacity duration-300"
            :class="minimized ? 'opacity-0' : 'opacity-100'"
          >
            {{ user?.displayName || user?.email || "User" }}
          </p>
        </Card>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen w-4/6">
      <!-- Header -->
      <header
        class="g-white shadow-sm border-b flex-shrink-0 + px-4 sm:px-8 py-4 flex justify-between items-center"
      >
        <div class="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            class="sm:hidden p-1"
            @click="showSidebar = !showSidebar"
          >
            <Bars3Icon class="w-6 h-6" v-if="!showSidebar" />
            <XMarkIcon class="w-6 h-6" v-else />
          </Button>
          <!-- <h2 class="text-xl sm:text-2xl font-semibold text-gray-900">
            Dashboard
          </h2> -->
        </div>

        <DropdownMenu class="w-40" align="end" sideOffset="4">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" class="flex items-center gap-2">
              {{ user?.displayName || user?.email || "User" }}
              <ChevronDownIcon class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent class="w-40">
            <DropdownMenuItem asChild>
              <NuxtLink to="/profile">Profile</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="handleLogout">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto p-4 sm:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
button[data-variant="ghost"]:hover {
  background-color: #f3f4f6;
}
</style>
