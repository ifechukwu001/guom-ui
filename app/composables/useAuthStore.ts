import type { AppUser } from "~/types/domain";
import { apiFetch, type ApiSuccess } from "~/utils/apiClient";

export const useAuthStore = () => {
  const user = useState<AppUser | null>("auth:user", () => null);
  const isReady = useState<boolean>("auth:isReady", () => false);

  const isAuthenticated = computed(() => Boolean(user.value));

  const setUser = (nextUser: AppUser | null) => {
    user.value = nextUser;
  };

  const loadProfile = async () => {
    try {
      const response =
        await apiFetch<ApiSuccess<{ id: string; email: string }>>(
          "/api/v1/user/me",
        );
      setUser(
        response.data
          ? { id: response.data.id, email: response.data.email }
          : null,
      );
    } catch {
      setUser(null);
    } finally {
      isReady.value = true;
    }
  };

  const signOut = async () => {
    try {
      await apiFetch<ApiSuccess<null>>("/api/v1/user/auth/signout", {
        method: "POST",
      });
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    isReady,
    isAuthenticated,
    loadProfile,
    setUser,
    signOut,
  };
};
