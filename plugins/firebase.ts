import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Validate required Firebase configuration
  const requiredConfig = [
    "firebaseApiKey",
    "firebaseAuthDomain",
    "firebaseProjectId",
    "firebaseStorageBucket",
    "firebaseMessagingSenderId",
    "firebaseAppId",
  ];

  const missingConfig = requiredConfig.filter((key) => !config.public[key]);
  if (missingConfig.length > 0) {
    console.error("Missing Firebase configuration:", missingConfig);
    throw new Error(
      `Missing Firebase configuration: ${missingConfig.join(", ")}`
    );
  }

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId,
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  // Initialize Analytics (only on client-side and if supported)
  let analytics = null;
  if (process.client) {
    isSupported().then((yes) => (yes ? (analytics = getAnalytics(app)) : null));
  }

  return {
    provide: {
      firebase: {
        app,
        auth,
        firestore,
        analytics,
      },
    },
  };
});
