<template>
  <div class="flex h-full flex-col">
    <div
      class="mb-3 flex shrink-0 items-center justify-between gap-2 border-b border-white/5 pb-3 px-2"
    >
      <div>
        <h2 class="text-sm font-semibold text-white">Chats</h2>
        <p class="text-xs text-slate-400">Recent sessions</p>
      </div>
      <UButton
        size="xs"
        variant="soft"
        color="primary"
        @click="$emit('refresh')"
        >Refresh</UButton
      >
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto grid content-start gap-2 pr-1">
      <button
        v-for="item in sessions"
        :key="item.id"
        type="button"
        class="chat-session-item"
        @click="$emit('select', item.id)"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="line-clamp-2 text-sm text-white">
            {{ item.prompt || "Untitled session" }}
          </p>
          <UBadge size="xs" variant="soft" :color="statusColor(item.status)">{{
            item.status
          }}</UBadge>
        </div>
        <p class="mt-1 text-xs text-slate-400">
          {{ formatDateTime(item.createdAt) }}
        </p>
      </button>

      <p
        v-if="!sessions.length"
        class="px-2 py-6 text-center text-xs text-slate-400"
      >
        No chats yet.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SessionListItem } from "~/types/domain";

const props = defineProps<{
  sessions: SessionListItem[];
}>();

defineEmits<{
  refresh: [];
  select: [id: string];
}>();

const statusColor = (status: SessionListItem["status"]) => {
  switch (status) {
    case "APPROVED":
    case "AVAILABLE":
    case "COMPLETED":
      return "success";
    case "REVIEW":
    case "PLAN":
      return "warning";
    default:
      return "neutral";
  }
};
</script>
