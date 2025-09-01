<template>
  <NuxtLayout>
    <div class="">
      <NuxtPage />
      <Toaster />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
</script>
