<template>
  <div class="session-layout fade-in">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-400">Session</p>
        <h1 class="text-2xl font-semibold text-white">{{ sessionId }}</h1>
      </div>
      <div class="flex items-center gap-2">
        <UBadge v-if="status" :color="statusColor" variant="soft">{{
          status.status
        }}</UBadge>
        <UBadge v-if="polling" color="neutral" variant="soft">Polling</UBadge>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-arrow-left"
          to="/app"
          >Back</UButton
        >
        <UButton color="neutral" variant="soft" @click="reload">Reload</UButton>
      </div>
    </div>

    <!-- Plan stages: PENDING / PLAN / REVIEW — full-width plan, no blends -->
    <div v-if="isPlanStage" class="grid gap-4">
      <PlanReviewPanel
        class="session-panel"
        v-model:feedback="feedback"
        :plan="plan"
        :reviewing="reviewing"
        :approving="approving"
        @review="review"
        @approve="approve"
      />
    </div>

    <!-- Blend stages: APPROVED / AVAILABLE / COMPLETED — collapsed plan + full-width blends -->
    <div v-else class="grid gap-4">
      <PlanReviewPanel
        class="session-panel"
        v-model:feedback="feedback"
        :plan="plan"
        :reviewing="reviewing"
        :approving="approving"
        :collapsed="true"
        @review="review"
        @approve="approve"
      />
      <BlendResultsPanel class="session-panel" :items="blends" />
    </div>

    <UAlert v-if="error" color="error" variant="soft" :title="error" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useSessionFlow } from "~/composables/useSessionFlow";
import { toUserFacingError } from "~/utils/userFacingError";

const route = useRoute();
const sessionId = computed(() => String(route.params.sessionId));
const flow = useSessionFlow();
const feedback = ref("");
const reviewing = ref(false);
const approving = ref(false);
const error = ref<string | null>(null);
const syncing = ref(false);

const {
  currentStatus: status,
  currentPlan: plan,
  blends,
  loadSessionState,
  polling,
  submitReviewAndWaitForPlan,
  approveAndPollBlends,
  continuePollingForSession,
} = flow;

const syncSessionProgress = async () => {
  if (syncing.value || !sessionId.value) return;

  syncing.value = true;
  try {
    await continuePollingForSession(sessionId.value);
  } catch (cause) {
    error.value = toUserFacingError(cause, "Unable to sync session progress");
  } finally {
    syncing.value = false;
  }
};

const reload = async () => {
  error.value = null;
  const loaded = await loadSessionState(sessionId.value);

  if (!loaded && !error.value) {
    error.value = "Unable to load session data.";
  }
};

onMounted(async () => {
  await reload();
  await syncSessionProgress();
});

const review = async (text: string) => {
  reviewing.value = true;
  error.value = null;
  try {
    if (!text.trim()) {
      error.value = "Provide feedback before submitting a review.";
      return;
    }

    await submitReviewAndWaitForPlan(text);
    await reload();
  } catch (cause) {
    error.value = toUserFacingError(cause, "Unable to submit review");
  } finally {
    reviewing.value = false;
  }
};

const approve = async () => {
  approving.value = true;
  error.value = null;
  try {
    await approveAndPollBlends();
    await reload();
  } catch (cause) {
    error.value = toUserFacingError(cause, "Unable to approve plan");
  } finally {
    approving.value = false;
  }
};

const statusColor = computed(() => {
  switch (status.value?.status) {
    case "APPROVED":
    case "AVAILABLE":
    case "COMPLETED":
      return "success";
    case "PLAN":
    case "REVIEW":
      return "warning";
    default:
      return "neutral";
  }
});

const isPlanStage = computed(() => {
  const s = status.value?.status;
  return !s || s === "PENDING" || s === "PLAN" || s === "REVIEW";
});
</script>
