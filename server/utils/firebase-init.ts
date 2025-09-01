import { initializeApp, getApps, cert } from "firebase-admin/app";
import { readFileSync } from "fs";
import { join } from "path";

export const initializeFirebaseAdmin = () => {
  // Only initialize if not already initialized
  if (getApps().length === 0) {
    try {
      const serviceAccountPath = join(process.cwd(), "serviceAccountKey.json");
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, "utf-8")
      );

      initializeApp({
        credential: cert(serviceAccount),
      });

      console.log("Firebase Admin SDK initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize Firebase Admin SDK:", error);
      return false;
    }
  }
  return true;
};
