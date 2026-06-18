<template>
  <div class="chat-layout fade-in">
    <aside class="chat-sidebar app-surface app-card p-3">
      <SessionListPane
        :sessions="sessions"
        @refresh="refreshSessions"
        @select="openSession"
      />
    </aside>

    <section class="chat-main app-surface app-card p-4 sm:p-5">
      <div class="chat-thread">
        <article class="chat-message chat-message-ai">
          <p class="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
            Guom AI
          </p>
          <p class="mt-2 text-sm text-slate-100">
            Ask for a product plan, architecture, or implementation outline. I
            will create a new session and route you to the live review
            workspace.
          </p>
        </article>

        <article
          v-if="files.length || libraryDocs.length"
          class="chat-message chat-message-ai"
        >
          <p class="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
            Context
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <UBadge
              v-for="file in files"
              :key="file.filename"
              color="neutral"
              variant="soft"
              class="cursor-pointer"
              @click="onRemove(file.filename)"
            >
              {{ file.filename.split("/").pop() }}
            </UBadge>
            <UBadge
              v-for="doc in libraryDocs"
              :key="doc.id"
              color="primary"
              variant="soft"
              class="cursor-pointer"
              @click="removeLibraryDoc(doc.id)"
            >
              {{ doc.filename.split("/").pop() }}
            </UBadge>
          </div>
        </article>

        <article v-if="prompt.trim()" class="chat-message chat-message-user">
          <p class="text-sm text-white">{{ prompt }}</p>
        </article>
      </div>

      <div class="chat-dock">
        <div class="chat-upload-row">
          <input ref="fileInput" type="file" class="hidden" @change="onPick" />
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-paperclip"
            @click="fileInput?.click()"
          >
            Attach file
          </UButton>
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-folder-open"
            @click="pickerOpen = true"
          >
            Browse library
          </UButton>
          <p class="text-xs text-slate-400">
            Attach docs or pick from your library to include context.
          </p>
        </div>
        <PromptComposer
          v-model="prompt"
          :loading="loading"
          @submit="createSession"
        />
      </div>
    </section>

    <DocumentPickerModal
      v-model:open="pickerOpen"
      @confirm="onLibraryConfirm"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :title="error"
      class="chat-alert"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  DocumentListItemResponseSchema,
  DocumentMetadata,
  StartSessionRequestSchema,
} from "~/types/openapi";
import { toUserFacingError } from "~/utils/userFacingError";

const flow = useSessionFlow();
const documentApi = useDocumentApi();
const prompt = ref("");
const files = ref<DocumentMetadata[]>([]);
const libraryDocs = ref<DocumentListItemResponseSchema[]>([]);
const pickerOpen = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const { sessions, loading, error, refreshSessions, startSession } = flow;

onMounted(async () => {
  await refreshSessions();
});

const createSession = async (value: string) => {
  if (!files.value.length && !libraryDocs.value.length) {
    error.value =
      "Attach at least one document before starting a chat session.";
    return;
  }

  const payload: StartSessionRequestSchema = {
    prompt: value,
    doc_metas: files.value,
    doc_ids: libraryDocs.value.map((d) => d.id),
  };

  const session = await startSession(payload);

  if (session?.id) {
    prompt.value = "";
    await navigateTo(`/app/session/${session.id}`);
  }
};

const openSession = async (sessionId: string) => {
  await navigateTo(`/app/session/${sessionId}`);
};

const onUpload = async (file: File) => {
  error.value = null;

  try {
    const uploaded = await documentApi.upload(file);

    if (!uploaded) {
      error.value =
        "Upload completed but the server did not return document metadata.";
      return;
    }

    files.value = [...files.value, uploaded];
  } catch (cause) {
    error.value = toUserFacingError(cause, "Unable to upload document");
  }
};

const onPick = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    onUpload(file);
    target.value = "";
  }
};

const onRemove = (filename: string) => {
  files.value = files.value.filter((item) => item.filename !== filename);
};

const onLibraryConfirm = (chosen: DocumentListItemResponseSchema[]) => {
  const existingIds = new Set(libraryDocs.value.map((d) => d.id));
  const next = chosen.filter((d) => !existingIds.has(d.id));
  libraryDocs.value = [...libraryDocs.value, ...next];
};

const removeLibraryDoc = (id: string) => {
  libraryDocs.value = libraryDocs.value.filter((d) => d.id !== id);
};
</script>
