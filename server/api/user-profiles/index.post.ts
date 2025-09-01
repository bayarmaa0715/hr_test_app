import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";

export default defineEventHandler(async (event) => {
  console.log("create user profile");
  try {
    await authMiddleware(event);
    const user = event.context.user;

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const body = await readBody(event);
    const { uid, firstName, lastName, email, role = "employee" } = body;

    if (!uid || !firstName || !lastName || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: "uid, firstName, lastName, and email are required",
      });
    }

    const { setDocument } = getFirebaseAdmin();

    const userProfile = {
      id: uid,
      uid,
      firstName,
      lastName,
      email,
      role: role as "admin" | "manager" | "employee",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDocument("userProfiles", uid, userProfile);

    return {
      success: true,
      message: "User profile created successfully",
      userProfile,
    };
  } catch (error: any) {
    console.error("Error creating user profile:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create user profile",
    });
  }
});
