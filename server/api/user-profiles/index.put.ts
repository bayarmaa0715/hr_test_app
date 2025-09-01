import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";

export default defineEventHandler(async (event) => {
  console.log("update user profile");
  try {
    await authMiddleware(event);
    const user = event.context.user;

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const body = await readBody(event);
    const { uid, firstName, lastName, email, role } = body;

    if (!uid) {
      throw createError({
        statusCode: 400,
        statusMessage: "uid is required",
      });
    }

    const { updateDocument, getDocument } = getFirebaseAdmin();

    // Check if user profile exists
    const existingProfile = await getDocument("userProfiles", uid);
    if (!existingProfile) {
      throw createError({
        statusCode: 404,
        statusMessage: "User profile not found",
      });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    await updateDocument("userProfiles", uid, updateData);

    // Get updated profile
    const updatedProfile = await getDocument("userProfiles", uid);

    return {
      success: true,
      message: "User profile updated successfully",
      userProfile: updatedProfile,
    };
  } catch (error: any) {
    console.error("Error updating user profile:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update user profile",
    });
  }
});
