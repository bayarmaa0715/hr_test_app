export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for authentication state to be determined
  if (loading.value) {
    return;
  }

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated.value && to.path !== "/") {
    return navigateTo("/");
  }

  // If user is authenticated and trying to access the home page, redirect to dashboard
  if (isAuthenticated.value && to.path === "/") {
    return navigateTo("/dashboard");
  }
});
