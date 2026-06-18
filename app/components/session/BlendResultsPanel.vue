<template>
  <SectionPanel>
    <template #header>
      <div>
        <h2 class="text-lg font-semibold text-white">Blend output</h2>
        <p class="text-sm text-slate-400">
          Cursor-based results from the final session state.
        </p>
      </div>
      <UBadge variant="soft" color="neutral">{{ items.length }} items</UBadge>
    </template>

    <div class="grid gap-3">
      <article
        v-for="item in items"
        :key="item.index"
        class="rounded-2xl border border-white/5 bg-white/3 p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-white">Blend {{ item.index }}</p>
          <p class="text-xs text-slate-400">
            {{ formatDateTime(item.createdAt) }}
          </p>
        </div>
        <MDC
          :value="item.content"
          tag="article"
          class="md-preview mt-3 max-h-80 text-sm leading-6"
        />
      </article>

      <p v-if="!items.length" class="text-sm text-slate-400">No results yet.</p>
    </div>
  </SectionPanel>
</template>

<script setup lang="ts">
import type { SessionBlendItem } from "~/types/domain";

defineProps<{
  items: SessionBlendItem[];
}>();
</script>
