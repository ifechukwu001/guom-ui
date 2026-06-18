<template>
  <NuxtLayout name="auth">
    <SectionPanel>
      <template #header>
        <div>
          <p class="text-sm uppercase tracking-[0.25em] text-emerald-300/80">
            Create your account
          </p>
          <h1 class="mt-2 text-2xl font-semibold text-white">Sign up</h1>
        </div>
      </template>

      <form class="grid gap-4" @submit.prevent="submit">
        <UInput v-model="email" type="email" placeholder="Email" />
        <UInput v-model="password" type="password" placeholder="Password" />
        <UAlert v-if="error" color="error" variant="soft" :title="error" />
        <div class="flex gap-3">
          <UButton color="primary" type="submit" :loading="loading"
            >Create account</UButton
          >
          <UButton color="neutral" variant="soft" to="/login"
            >Back to sign in</UButton
          >
        </div>
      </form>
    </SectionPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { getErrorStatus, toUserFacingError } from "~/utils/userFacingError";

const auth = useAuthApi();
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);

const submit = async () => {
  loading.value = true;
  error.value = null;
  try {
    await auth.signUp({ email: email.value, password: password.value });
    await navigateTo("/app");
  } catch (cause) {
    error.value =
      getErrorStatus(cause) === 401
        ? "Unable to create account. Please verify your details and try again."
        : toUserFacingError(cause, "Unable to create account");
  } finally {
    loading.value = false;
  }
};
</script>
