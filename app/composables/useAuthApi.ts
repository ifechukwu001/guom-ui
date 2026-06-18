import type {
  LoginRequestSchema,
  RegisterRequestSchema,
  SuccessResponse,
  ProfileResponseSchema,
} from "~/types/openapi";
import type { AppUser } from "~/types/domain";
import { apiFetch } from "~/utils/apiClient";

export const useAuthApi = () => {
  const authStore = useAuthStore();

  const mapUser = (
    data: ProfileResponseSchema | null | undefined,
  ): AppUser | null => (data ? { id: data.id, email: data.email } : null);

  const signIn = async (body: LoginRequestSchema) => {
    await apiFetch<SuccessResponse<null>>("/api/v1/user/auth/signin", {
      method: "POST",
      body,
    });
    await authStore.loadProfile();
  };

  const signUp = async (body: RegisterRequestSchema) => {
    await apiFetch<SuccessResponse<null>>("/api/v1/user/auth/signup", {
      method: "POST",
      body,
    });
    await authStore.loadProfile();
  };

  const refresh = async () => {
    await apiFetch<SuccessResponse<null>>("/api/v1/user/auth/refresh", {
      method: "POST",
    });
    await authStore.loadProfile();
  };

  const me = async () => {
    const response =
      await apiFetch<SuccessResponse<ProfileResponseSchema>>("/api/v1/user/me");
    return mapUser(response.data);
  };

  return { signIn, signUp, refresh, me };
};
