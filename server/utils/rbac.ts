import type { EventHandlerRequest, H3Event } from "h3";

export type Role = "admin" | "manager" | "employee";
export type Permission = "create" | "read" | "update" | "delete";

// Define role permissions
const rolePermissions: Record<Role, Permission[]> = {
  admin: ["create", "read", "update", "delete"],
  manager: ["create", "read", "update"],
  employee: ["read"],
};

// Check if user has required permission
export function hasPermission(
  userRole: Role,
  requiredPermission: Permission
): boolean {
  return rolePermissions[userRole]?.includes(requiredPermission) || false;
}

// Check if user can access specific resource (for employees accessing their own data)
export function canAccessResource(
  userRole: Role,
  userUid: string,
  resourceOwnerUid?: string,
  requiredPermission: Permission = "read"
): boolean {
  // Admin and managers can access all resources (within their permission scope)
  if (userRole === "admin" || userRole === "manager") {
    return hasPermission(userRole, requiredPermission);
  }

  // Employees can only access their own data
  if (userRole === "employee" && requiredPermission === "read") {
    return userUid === resourceOwnerUid;
  }

  return false;
}

// RBAC middleware factory
export function createRBACMiddleware(
  requiredPermission: Permission,
  options?: {
    checkResourceOwnership?: boolean;
    getResourceOwnerUid?: (
      event: H3Event<EventHandlerRequest>
    ) => Promise<string | undefined> | string | undefined;
  }
) {
  return async (event: H3Event<EventHandlerRequest>) => {
    const user = event.context.user;

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized - User not authenticated",
      });
    }

    const userRole = user.role as Role;

    // For simple permission checks
    if (!options?.checkResourceOwnership) {
      if (!hasPermission(userRole, requiredPermission)) {
        throw createError({
          statusCode: 403,
          statusMessage: `Forbidden - ${userRole} role does not have ${requiredPermission} permission`,
        });
      }
      return;
    }

    // For resource ownership checks (employees accessing their own data)
    if (options.getResourceOwnerUid) {
      const resourceOwnerUid = await options.getResourceOwnerUid(event);

      if (
        !canAccessResource(
          userRole,
          user.uid,
          resourceOwnerUid,
          requiredPermission
        )
      ) {
        throw createError({
          statusCode: 403,
          statusMessage: `Forbidden - Cannot ${requiredPermission} this resource`,
        });
      }
      return;
    }

    // Default permission check
    if (!hasPermission(userRole, requiredPermission)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Forbidden - ${userRole} role does not have ${requiredPermission} permission`,
      });
    }
  };
}

// Helper function to get user profile UID from employee data
export async function getEmployeeOwnerUid(
  employeeId: string
): Promise<string | undefined> {
  try {
    const { getFirebaseAdmin } = await import("./firebase-admin");
    const { getDocument } = getFirebaseAdmin();

    const employee = await getDocument("employees", employeeId);
    if (!employee?.userProfileId) return undefined;

    const userProfile = await getDocument(
      "userProfiles",
      employee.userProfileId
    );
    return userProfile?.uid;
  } catch (error) {
    console.error("Error getting employee owner UID:", error);
    return undefined;
  }
}
