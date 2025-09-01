import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User, AuthError } from "firebase/auth";
import { ref, computed } from "vue";
import type { AuthMethods } from "~/types/auth";
import type { UserProfile } from "~/types/model";

export const useAuth = () => {
  const { $firebase } = useNuxtApp();
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.email?.includes("admin") || false);

  // Initialize auth listener immediately
  let unsubscribe: (() => void) | null = null;

  if (process.client) {
    unsubscribe = onAuthStateChanged($firebase.auth, async (currentUser) => {
      user.value = currentUser;
      loading.value = false;
      console.log("user mlll  save", user.value);
      if (currentUser) {
        const userData = {
          uid: currentUser.uid,
          email: currentUser.email,
        };
        try {
          const token = await currentUser.getIdToken();
          const profile = await $fetch<UserProfile>(
            `/api/user-profiles/${currentUser.uid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("profile", profile);
          user.value = {
            ...currentUser,
            displayName: `${profile.firstName} ${profile.lastName}`, // Firestore profile
          };
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
        localStorage.setItem("currentUser", JSON.stringify(userData));
      } else {
        localStorage.removeItem("currentUser");
      }
    });
  }

  // Cleanup function for components that need it
  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };

  const signIn: AuthMethods["signIn"] = async (email, password) => {
    try {
      console.log(" email and password", email, password);
      console.log("     $firebase.auth,", $firebase.auth);
      loading.value = true;

      const result = await signInWithEmailAndPassword(
        $firebase.auth,
        email,
        password
      );
      console.log("result", result);
      user.value = result.user;
      return result;
    } catch (err) {
      console.log("error", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const signUp: AuthMethods["signUp"] = async (
    email,
    password,
    userData?: { firstName?: string; lastName?: string; role?: string }
  ) => {
    try {
      console.log(" email and password", email, password);
      loading.value = true;
      error.value = null;
      const result = await createUserWithEmailAndPassword(
        $firebase.auth,
        email,
        password
      );
      user.value = result.user;

      // Create UserProfile if userData is provided
      if (userData && result.user) {
        try {
          const token = await result.user.getIdToken();
          await $fetch("/api/user-profiles", {
            method: "POST",
            body: {
              uid: result.user.uid,
              firstName: userData.firstName || "User",
              lastName: userData.lastName || "Name",
              email: result.user.email,
              role: userData.role || "employee",
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("UserProfile created successfully");
        } catch (profileError) {
          console.error("Error creating UserProfile:", profileError);
          // Don't throw here to avoid breaking the signup flow
        }
      }

      return result;
    } catch (err) {
      const authError = err as AuthError;
      error.value = authError.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      loading.value = true;
      await signOut($firebase.auth);
      user.value = null;
    } catch (err) {
      console.log("log out err", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get current user's ID token for API calls
  const getIdToken = async (): Promise<string | null> => {
    if (!user.value) return null;

    try {
      return await user.value.getIdToken();
    } catch (err) {
      console.error("Failed to get ID token:", err);
      return null;
    }
  };

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    isAuthenticated,
    isAdmin,

    // Methods
    signIn,
    signUp,
    logout,
    getIdToken,
    clearError,
    cleanup,
  };
};
