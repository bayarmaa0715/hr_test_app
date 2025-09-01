import { defineEventHandler, readBody, createError } from "h3";
import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import type { Employee, UserProfile } from "~/types/model";
import authMiddleware from "../../../middleware/auth.server.js";
export default defineEventHandler(async (event) => {
  console.log("POST /api/employees ");
  await authMiddleware(event);
  const user = event.context.user;
  console.log("User from context:", user.context);

  try {
    const body = await readBody<{
      user: Partial<UserProfile>;
      employee: Partial<Employee>;
    }>(event);

    console.log("POST request body:", body);

    const admin = getFirebaseAdmin();

    // Create user profile first
    let newUser: UserProfile;
    if (body.user) {
      const userId = crypto.randomUUID();
      newUser = {
        id: userId,
        uid: userId, // For now, use the same ID
        firstName: body.user.firstName || "",
        lastName: body.user.lastName || "",
        email: body.user.email || "",
        role: body.user.role || "employee",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await admin.setDocument("userProfiles", userId, newUser);
      console.log("New user profile created:", newUser);
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "User data is required",
      });
    }

    // Create employee record
    let newEmployee: Employee;
    if (body.employee) {
      const employeeId = crypto.randomUUID();
      newEmployee = {
        id: employeeId,
        userProfileId: newUser.id,
        positionId: body.employee.positionId || "",
        locationId: body.employee.locationId || "",
        hireDate: body.employee.hireDate
          ? new Date(body.employee.hireDate)
          : new Date(),
        salary: body.employee.salary || 0,
        isActive:
          body.employee.isActive !== undefined ? body.employee.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await admin.setDocument("employees", employeeId, newEmployee);
      console.log("New employee created:", newEmployee);
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "Employee data is required",
      });
    }

    return {
      success: true,
      message: "Employee created successfully",
      data: {
        user: newUser,
        employee: newEmployee,
      },
    };
  } catch (error: any) {
    console.error("Error in POST /api/employees:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: `Failed to create employee: ${error.message || error}`,
    });
  }
});
