import { computed } from "vue";
import type { UserProfile } from "~/types/model";

export type Role = "admin" | "manager" | "employee";
export type Permission = "create" | "read" | "update" | "delete";

const rolePermissions: Record<Role, Permission[]> = {
  admin: ["create", "read", "update", "delete"],
  manager: ["create", "read", "update"],
  employee: ["read"],
};

export const useRBAC = () => {
  const { user } = useAuth();
  const { get } = useApi();

  const userProfile = ref<UserProfile | null>(null);
  const loading = ref(false);

  //know cuurent user profile
  watch(
    user,
    async (currentUser) => {
      if (currentUser?.uid) {
        try {
          loading.value = true;
          const profile = await get<UserProfile>(
            `/api/user-profiles/${currentUser.uid}`
          );
          userProfile.value = profile;
        } catch (error) {
          console.error("Failed to fetch user profile for RBAC:", error);
          userProfile.value = null;
        } finally {
          loading.value = false;
        }
      } else {
        userProfile.value = null;
      }
    },
    { immediate: true }
  );

  //  role checking
  const currentRole = computed(() => userProfile.value?.role as Role | null);
  const isAdmin = computed(() => currentRole.value === "admin");
  const isManager = computed(() => currentRole.value === "manager");
  const isEmployee = computed(() => currentRole.value === "employee");

  // Check if user has specific permission

  const hasPermission = (permission: Permission): boolean => {
    if (!currentRole.value) return false;
    return rolePermissions[currentRole.value]?.includes(permission) || false;
  };

  // Check if user can access specific resource
  const canAccessResource = (
    resourceOwnerUid?: string,
    permission: Permission = "read"
  ): boolean => {
    if (!currentRole.value || !user.value) return false;

    // Admin and managers can access all resources (within their permission scope)
    if (currentRole.value === "admin" || currentRole.value === "manager") {
      return hasPermission(permission);
    }

    // Employees can only read their own data
    if (currentRole.value === "employee" && permission === "read") {
      return user.value.uid === resourceOwnerUid;
    }

    return false;
  };

  // Computed permission flags for easy template usage
  const permissions = computed(() => ({
    canCreate: hasPermission("create"),
    canRead: hasPermission("read"),
    canUpdate: hasPermission("update"),
    canDelete: hasPermission("delete"),
  }));

  // UI helper functions
  const shouldShowElement = (requiredPermission: Permission): boolean => {
    return hasPermission(requiredPermission);
  };

  const shouldDisableElement = (requiredPermission: Permission): boolean => {
    return !hasPermission(requiredPermission);
  };

  // Resource-specific permissions
  const canManageUsers = computed(() => isAdmin.value);
  const canManageEmployees = computed(() => isAdmin.value || isManager.value);
  const canManageDepartments = computed(() => isAdmin.value || isManager.value);

  return {
    // State
    userProfile: readonly(userProfile),
    loading: readonly(loading),
    currentRole,

    // Role checks
    isAdmin,
    isManager,
    isEmployee,

    // Permission checks
    hasPermission,
    canAccessResource,
    permissions,

    // UI helpers
    shouldShowElement,
    shouldDisableElement,

    // Specific permissions
    canManageUsers,
    canManageEmployees,
    canManageDepartments,
  };
};
