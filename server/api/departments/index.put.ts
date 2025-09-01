import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import type { Department, Position } from "~/types/model";
import authMiddleware from "../../../middleware/auth.server.js";

export default defineEventHandler(async (event) => {
  console.log("PUT endpoint reached");

  // Get authenticated user from context (set by middleware)

  await authMiddleware(event);
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  try {
    const body = await readBody(event);
    console.log("PUT request body:", body);

    const admin = getFirebaseAdmin();

    // Handle department update
    let updatedDepartment: Department | undefined;
    if (body.department && body.department.id) {
      const existingDept = await admin.getDocument(
        "departments",
        body.department.id
      );
      if (existingDept) {
        updatedDepartment = {
          ...existingDept,
          ...body.department,
          id: body.department.id,
          updatedAt: new Date(),
        } as Department;
        await admin.updateDocument(
          "departments",
          body.department.id,
          updatedDepartment
        );
        console.log("Department updated:", updatedDepartment);
      } else {
        throw createError({
          statusCode: 404,
          statusMessage: "Department not found",
        });
      }
    }

    // Handle positions update
    const updatedPositions: Position[] = [];
    if (body.positions && Array.isArray(body.positions)) {
      for (const pos of body.positions) {
        if (pos.id) {
          const existingPos = await admin.getDocument("positions", pos.id);
          if (existingPos) {
            const updatedPos: Position = {
              ...existingPos,
              ...pos,
              id: pos.id,
              updatedAt: new Date(),
            } as Position;
            await admin.updateDocument("positions", pos.id, updatedPos);
            updatedPositions.push(updatedPos);
            console.log("Position updated:", updatedPos);
          } else {
            throw createError({
              statusCode: 404,
              statusMessage: `Position with ID ${pos.id} not found`,
            });
          }
        }
      }
    }

    return {
      success: true,
      message: "Update successful",
      data: {
        department: updatedDepartment,
        positions: updatedPositions,
      },
    };
  } catch (error: any) {
    console.error("Error in PUT /api/departments:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: `Failed to update: ${error.message || error}`,
    });
  }
});
