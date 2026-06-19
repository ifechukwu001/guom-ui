<template>
  <SectionPanel>
    <template #header>
      <div class="min-w-0 flex-1">
        <h2 class="text-lg font-semibold text-white">Plan review</h2>
        <p v-if="!collapsed || expanded" class="text-sm text-slate-400">
          Review the generated plan, add feedback, and approve when ready.
        </p>
        <p v-else class="text-sm text-slate-400">
          Plan available — expand to review.
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <UBadge
          v-if="plan"
          :color="plan.stale ? 'warning' : 'success'"
          variant="soft"
        >
          {{ plan.stale ? "Stale" : "Fresh" }}
        </UBadge>
        <UButton
          v-if="collapsed"
          size="xs"
          color="neutral"
          variant="soft"
          :icon="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          @click="expanded = !expanded"
        >
          {{ expanded ? "Collapse" : "Expand" }}
        </UButton>
      </div>
    </template>

    <template v-if="!collapsed || expanded">
      <div v-if="plan" class="grid gap-4">
        <MDC
          :value="plan.message"
          tag="article"
          class="md-preview max-h-96 text-sm leading-6"
        />

        <form
          v-if="!collapsed"
          class="grid gap-4"
          @submit.prevent="$emit('review', feedback)"
        >
          <UTextarea
            v-model="feedback"
            :rows="4"
            placeholder="Leave feedback for the plan..."
          />
          <div class="flex flex-wrap gap-3">
            <UButton
              color="neutral"
              variant="soft"
              :loading="reviewing"
              :disabled="approving"
              type="submit"
              >Submit review</UButton
            >
            <UButton
              color="primary"
              :loading="approving"
              :disabled="reviewing"
              type="button"
              @click="$emit('approve')"
              >Approve plan</UButton
            >
          </div>
        </form>
      </div>

      <p v-else class="text-xl text-center text-slate-400">
        No plan is available yet for this session.
      </p>
    </template>
  </SectionPanel>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { SessionPlan } from "~/types/domain";

const feedback = defineModel<string>("feedback", { default: "" });

const props = defineProps<{
  plan: SessionPlan | null;
  reviewing?: boolean;
  approving?: boolean;
  collapsed?: boolean;
}>();

defineEmits<{
  review: [feedback: string];
  approve: [];
}>();

const expanded = ref(false);

watch(
  () => props.collapsed,
  (val) => {
    if (val) expanded.value = false;
  },
);
</script>
