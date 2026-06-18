<template>
  <UModal
    v-model:open="open"
    title="Select documents"
    description="Choose previously uploaded documents to include in this session."
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="grid gap-3">
        <div v-if="loading" class="py-4 text-center text-sm text-slate-400">
          Loading documents…
        </div>
        <div
          v-else-if="loadError"
          class="py-4 text-center text-sm text-red-400"
        >
          {{ loadError }}
        </div>
        <div
          v-else-if="docs.length"
          class="grid max-h-72 gap-2 overflow-y-auto pr-1"
        >
          <label
            v-for="doc in docs"
            :key="doc.id"
            class="doc-picker-row"
            :class="{ 'doc-picker-row--selected': selected.has(doc.id) }"
          >
            <UCheckbox
              :model-value="selected.has(doc.id)"
              :name="doc.id"
              @update:model-value="toggle(doc.id)"
            />
            <span class="truncate text-sm text-white">{{
              displayName(doc.filename)
            }}</span>
          </label>
        </div>
        <p v-else class="py-4 text-center text-sm text-slate-400">
          No documents uploaded yet.
        </p>
      </div>
    </template>

    <template #footer>
      <UButton color="neutral" variant="soft" @click="open = false"
        >Cancel</UButton
      >
      <UButton color="primary" :disabled="selected.size === 0" @click="confirm">
        Add {{ selected.size > 0 ? selected.size : "" }} document{{
          selected.size !== 1 ? "s" : ""
        }}
      </UButton>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { DocumentListItemResponseSchema } from "~/types/openapi";
import { toUserFacingError } from "~/utils/userFacingError";

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  confirm: [docs: DocumentListItemResponseSchema[]];
}>();

const documentApi = useDocumentApi();

const docs = ref<DocumentListItemResponseSchema[]>([]);
const selected = ref<Set<string>>(new Set());
const loading = ref(false);
const loadError = ref<string | null>(null);

const displayName = (filename: string) => filename.split("/").pop() ?? filename;

const toggle = (id: string) => {
  const next = new Set(selected.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selected.value = next;
};

const confirm = () => {
  const chosen = docs.value.filter((d) => selected.value.has(d.id));
  emit("confirm", chosen);
  selected.value = new Set();
  open.value = false;
};

const load = async () => {
  loading.value = true;
  loadError.value = null;
  try {
    docs.value = await documentApi.listFiles();
  } catch (cause) {
    loadError.value = toUserFacingError(cause, "Unable to load documents");
  } finally {
    loading.value = false;
  }
};

watch(open, (isOpen) => {
  if (isOpen) {
    selected.value = new Set();
    load();
  }
});
</script>

<style scoped>
.doc-picker-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid var(--app-border);
  background: rgba(12, 21, 36, 0.6);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.doc-picker-row:hover {
  border-color: rgba(86, 209, 155, 0.35);
  background: rgba(20, 33, 56, 0.75);
}

.doc-picker-row--selected {
  border-color: rgba(86, 209, 155, 0.55);
  background: rgba(86, 209, 155, 0.08);
}
</style>
