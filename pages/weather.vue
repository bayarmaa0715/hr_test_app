<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useApi } from "~/composables/useApi";

definePageMeta({
  layout: "main",
  middleware: "auth",
});

const { get } = useApi();

interface WeatherData {
  id: string;
  city: string;
  country: string;
  temp: number;
  weather: string;
  windSpeed: number;
  humidity: number;
  pressure: number;
  icon: string;
  employeeCount: number;
}

const weatherData = ref<WeatherData[]>([]);

const weatherQuery = useQuery({
  queryKey: ["weather"],
  queryFn: async () => {
    const res: WeatherData[] = await get("/api/weather");
    console.log("weather data", res);
    return res;
  },
  refetchInterval: 300000, // Refetch every 5 minutes
});

// Watch for weather data changes
watch(
  () => weatherQuery.data.value,
  (data) => {
    if (data) {
      weatherData.value = data;
    }
  },
  { immediate: true }
);

const getWeatherIcon = (icon: string) => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};

const formatTemperature = (temp: number) => {
  return `${Math.round(temp)}°C`;
};

const formatWindSpeed = (speed: number) => {
  return `${speed} m/s`;
};

const formatPressure = (pressure: number) => {
  return `${pressure} hPa`;
};
</script>

<template>
  <div class="container mx-auto p-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Weather for Employee Locations</h1>
      <div class="text-sm text-gray-500">
        Last updated: {{ new Date().toLocaleTimeString() }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="weatherQuery.isLoading.value" class="text-center py-8">
      <div class="text-lg text-gray-600">Loading weather data...</div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="weatherQuery.error.value"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <div class="text-red-800">
        Error loading weather data: {{ weatherQuery.error.value.message }}
      </div>
    </div>

    <!-- Weather Cards -->
    <div
      v-else-if="weatherData.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="weather in weatherData"
        :key="weather.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <!-- City Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">
            {{ weather.city }}
          </h3>
          <div class="text-right">
            <span class="text-sm text-gray-500 uppercase block">
              {{ weather.country }}
            </span>
            <span class="text-xs text-blue-600 font-medium">
              {{ weather.employeeCount }} employee{{
                weather.employeeCount !== 1 ? "s" : ""
              }}
            </span>
          </div>
        </div>

        <!-- Weather Icon and Temperature -->
        <div class="flex items-center justify-center mb-4">
          <img
            :src="getWeatherIcon(weather.icon)"
            :alt="weather.weather"
            class="w-16 h-16"
          />
          <div class="ml-4">
            <div class="text-3xl font-bold text-gray-900">
              {{ formatTemperature(weather.temp) }}
            </div>
            <div class="text-sm text-gray-600 capitalize">
              {{ weather.weather }}
            </div>
          </div>
        </div>

        <!-- Weather Details -->
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Wind Speed:</span>
            <span class="font-medium">{{
              formatWindSpeed(weather.windSpeed)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Humidity:</span>
            <span class="font-medium">{{ weather.humidity }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Pressure:</span>
            <span class="font-medium">{{
              formatPressure(weather.pressure)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <div class="text-lg text-gray-600">No weather data available</div>
      <div class="text-sm text-gray-500 mt-2">
        Make sure you have initialized the test data with locations
      </div>
    </div>
  </div>
</template>
