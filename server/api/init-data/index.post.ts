import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";

export default defineEventHandler(async (event) => {
  console.log("Initializing test data...");
  try {
    await authMiddleware(event);
    const user = event.context.user;

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const { initializeTestData } = getFirebaseAdmin();
    await initializeTestData();

    return {
      success: true,
      message: "Test data initialized successfully",
    };
  } catch (error) {
    console.error("Error initializing test data:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to initialize test data",
    });
  }
});
