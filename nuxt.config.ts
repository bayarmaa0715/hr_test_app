import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from env/firebase.env
const envPath = join(process.cwd(), "env", "firebase.env");
const envContent = readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};

envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && !key.startsWith("#")) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  pages: true,

  vite: {
    plugins: [tailwindcss()],
    define: {
      // Make Firebase env variables available to the client
      "process.env.FIREBASE_API_KEY": JSON.stringify(env.FIREBASE_API_KEY),
      "process.env.FIREBASE_AUTH_DOMAIN": JSON.stringify(
        env.FIREBASE_AUTH_DOMAIN
      ),
      "process.env.FIREBASE_PROJECT_ID": JSON.stringify(
        env.FIREBASE_PROJECT_ID
      ),
      "process.env.FIREBASE_STORAGE_BUCKET": JSON.stringify(
        env.FIREBASE_STORAGE_BUCKET
      ),
      "process.env.FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
        env.FIREBASE_MESSAGING_SENDER_ID
      ),
      "process.env.FIREBASE_APP_ID": JSON.stringify(env.FIREBASE_APP_ID),
      "process.env.FIREBASE_MEASUREMENT_ID": JSON.stringify(
        env.FIREBASE_MEASUREMENT_ID
      ),
    },
  },

  modules: ["shadcn-nuxt"],

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },

  runtimeConfig: {
    // Server-side only
    firebaseClientEmail: env.FIREBASE_CLIENT_EMAIL,
    firebasePrivateKey: env.FIREBASE_PRIVATE_KEY,
    firebaseProjectId: env.FIREBASE_PROJECT_ID,
    locationApiUrl: env.LOCATION_API_URL,
    locationApiKey: env.LOCATION_API_KEY,
    rapidApiKey: env.RAPIDAPI_KEY,
    rapidApiHost: env.RAPIDAPI_HOST,
    openWeatherMapApiKey: env.OPENWEATHERMAP_API_KEY,

    public: {
      firebaseApiKey: env.FIREBASE_API_KEY,
      firebaseAuthDomain: env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: env.FIREBASE_APP_ID,
      firebaseMeasurementId: env.FIREBASE_MEASUREMENT_ID,
    },
  },
});
