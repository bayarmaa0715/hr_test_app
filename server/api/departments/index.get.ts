import { defineEventHandler } from "h3";
import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";
export default defineEventHandler(async (event) => {
  try {
    const admin = getFirebaseAdmin();
    const departments = await admin.getCollection("departments");
    const positions = await admin.getCollection("positions");

    return { departments, positions };
  } catch (err) {
    console.error("Error fetching departments:", err);
    throw createError({ statusCode: 500, statusMessage: "Server error" });
  }
});
