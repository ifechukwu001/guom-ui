<template>
  <div class="grid gap-3">
    <div v-if="loading" class="space-y-3">
      <USkeleton class="h-6 w-56" />
      <USkeleton class="h-28 w-full" />
    </div>

    <UAlert v-else-if="error" color="error" variant="soft" :title="title" :description="error" />

    <slot v-else />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean
  error?: string | null
  title?: string
}>()
</script>
