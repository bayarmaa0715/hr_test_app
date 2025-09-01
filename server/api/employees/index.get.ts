import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";

export default defineEventHandler(async (event) => {
  console.log("get employees");
  try {
    await authMiddleware(event);

    const user = event.context.user;
    const { getCollection } = getFirebaseAdmin();

    const employees = await getCollection("employees");
    const userProfiles = await getCollection("userProfiles");

    return {
      employees,
      userProfiles,
    };
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch employees",
    });
  }
});
