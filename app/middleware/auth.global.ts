export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  const isAuthPage = to.path === "/login" || to.path === "/signup";
  const requiresAuth = to.path.startsWith("/app");

  // Revalidate on auth and protected routes to prevent stale client state.
  if (!authStore.isReady || isAuthPage || requiresAuth) {
    await authStore.loadProfile();
  }

  const publicRoutes = ["/", "/login", "/signup"];

  if (requiresAuth && !authStore.isAuthenticated) {
    return navigateTo("/login");
  }

  if (
    !publicRoutes.includes(to.path) &&
    !requiresAuth &&
    to.path !== "/login" &&
    to.path !== "/signup"
  ) {
    return navigateTo("/");
  }
});
