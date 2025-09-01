import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";
export default defineEventHandler(async (event) => {
  console.log("put employee");
  try {
    await authMiddleware(event);
    const user = event.context.user;

    const body = await readBody(event);
    const { employeeId, userData, employeeData } = body;

    if (!employeeId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Employee ID is required",
      });
    }

    const { updateDocument, getDocument, updateUser } = getFirebaseAdmin();

    // Update user profile if provided
    if (userData) {
      const userProfileId = employeeData?.userProfileId;
      if (userProfileId) {
        await updateDocument("userProfiles", userProfileId, {
          ...userData,
          updatedAt: new Date(),
        });
        if (userProfileId?.uid)
          await updateUser(userProfileId.uid, {
            email: userData.email,
          });
      }
    }

    // Update employee data if provided
    if (employeeData) {
      await updateDocument("employees", employeeId, {
        ...employeeData,
        updatedAt: new Date(),
      });
    }

    // Fetch updated data
    const updatedEmployee = await getDocument("employees", employeeId);
    const updatedUser = employeeData?.userProfileId
      ? await getDocument("userProfiles", employeeData.userProfileId)
      : null;

    return {
      employee: updatedEmployee,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating employee:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update employee",
    });
  }
});
