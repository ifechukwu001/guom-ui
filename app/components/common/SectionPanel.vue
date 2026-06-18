<template>
  <section class="app-surface app-card flex flex-col overflow-hidden">
    <div
      v-if="$slots.header"
      class="shrink-0 flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4"
    >
      <slot name="header" />
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
      <slot />
    </div>
  </section>
</template>
