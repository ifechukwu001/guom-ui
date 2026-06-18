<template>
  <div class="app-shell">
    <NuxtLoadingIndicator color="#56d19b" />
    <div class="flex h-dvh w-full flex-col px-3 py-3 sm:px-4 lg:px-6">
      <AppHeader @logout="handleLogout" />
      <main class="app-shell-main py-3 sm:py-4">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.signOut();
  await navigateTo("/login");
};
</script>
