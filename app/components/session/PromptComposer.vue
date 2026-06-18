<template>
  <form class="chat-composer" @submit.prevent="onSubmit">
    <UTextarea
      v-model="prompt"
      name="prompt"
      :rows="3"
      :maxrows="8"
      autoresize
      placeholder="Message Guom AI..."
    />

    <div class="chat-composer-actions">
      <p class="text-xs text-slate-400">
        Enter to send, Shift + Enter for a new line
      </p>
      <UButton color="primary" type="submit" :loading="loading"> Send </UButton>
    </div>
  </form>
</template>

<script setup lang="ts">
const prompt = defineModel<string>({ default: "" });

defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [prompt: string];
}>();

const onSubmit = (event: Event) => {
  const form = event.currentTarget as HTMLFormElement | null;
  const raw = form?.elements.namedItem("prompt") as HTMLTextAreaElement | null;
  const value = (raw?.value ?? prompt.value ?? "").trim();

  if (!value) {
    return;
  }

  prompt.value = value;
  emit("submit", value);
};
</script>
