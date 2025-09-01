import { defineEventHandler, readBody, createError } from "h3";
import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import type { Department, Position } from "~/types/model";
import authMiddleware from "../../../middleware/auth.server.js";
export default defineEventHandler(async (event) => {
  console.log("DELETE endpoint reached");
  await authMiddleware(event);
  const user = event.context.user;
  console.log("User from context:", user);

  try {
    const body = await readBody(event);
    console.log("DELETE request body:", body);
    console.log("Body type:", typeof body);
    console.log(
      "Body keys:",
      body ? Object.keys(body) : "Body is null/undefined"
    );

    const admin = getFirebaseAdmin();

    // Handle position deletion only
    if (body.positionId) {
      const existingPos = await admin.getDocument("positions", body.positionId);
      if (existingPos) {
        await admin.deleteDocument("positions", body.positionId);
        console.log("Position deleted:", body.positionId);

        return {
          success: true,
          message: "Position deleted successfully",
          deletedPosition: body.positionId,
        };
      } else {
        throw createError({
          statusCode: 404,
          statusMessage: "Position not found",
        });
      }
    }

    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request - Must provide positionId",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/departments:", error);

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
