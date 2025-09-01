import { initializeFirebaseAdmin } from "../utils/firebase-init";
import { getFirebaseAdmin } from "../utils/firebase-admin";

export default defineNitroPlugin(async () => {
  // Initialize Firebase Admin SDK at server startup
  console.log("Initializing Firebase Admin SDK...");
  const success = initializeFirebaseAdmin();

  if (success) {
    console.log(
      "Firebase Admin SDK initialized successfully at server startup"
    );

    // Initialize test data after Firebase Admin is ready
    try {
      const admin = getFirebaseAdmin();
      //   await admin.initializeTestData();
    } catch (error) {
      console.error("Failed to initialize test data:", error);
    }
  } else {
    console.error("Failed to initialize Firebase Admin SDK at server startup");
  }
});
