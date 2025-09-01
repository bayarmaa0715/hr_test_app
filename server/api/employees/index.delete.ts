import { defineEventHandler, readBody, createError } from "h3";
import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import type { Department, Position } from "~/types/model";
import authMiddleware from "../../../middleware/auth.server.js";
export default defineEventHandler(async (event) => {
  console.log("DELETE endpoint reached employees");
  await authMiddleware(event);
  const user = event.context.user;

  try {
    const body = await readBody(event);

    const admin = getFirebaseAdmin();

    if (body.employeeId) {
      const existingEmp = await admin.getDocument("employees", body.employeeId);
      if (existingEmp) {
        if (existingEmp.userProfileId) {
          await admin.deleteDocument("userProfiles", existingEmp.userProfileId);
          console.log("User profile deleted:", existingEmp.userProfileId);
        }

        await admin.deleteDocument("employees", body.employeeId);
        console.log("Employee deleted:", body.employeeId);

        return {
          success: true,
          message: "employee deleted successfully",
          deletedEmp: {
            employeeId: body.employeeId,
            userProfileId: existingEmp.userProfileId,
          },
        };
      } else {
        throw createError({
          statusCode: 404,
          statusMessage: "employee not found",
        });
      }
    }

    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request - Must provide employee",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/employees:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: `Failed to delete: ${error.message || error}`,
    });
  }
});
