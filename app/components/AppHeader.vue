<template>
  <header
    class="app-surface app-card flex items-center justify-between gap-4 px-4 py-3"
  >
    <NuxtLink to="/" class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30"
      >
        <span class="text-sm font-semibold">G</span>
      </div>
      <div>
        <p class="text-sm font-semibold tracking-wide text-white">Guom AI</p>
        <p class="text-xs text-slate-400">AI Agent that reads for you.</p>
      </div>
    </NuxtLink>

    <div class="flex items-center gap-2">
      <slot name="actions" />
      <ClientOnly>
        <UButton
          v-if="user"
          variant="soft"
          color="neutral"
          size="sm"
          @click="$emit('logout')"
        >
          Sign out
        </UButton>
      </ClientOnly>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  logout: [];
}>();

const { user } = useAuthStore();
</script>
