<template>
  <SectionPanel>
    <template #header>
      <div>
        <h2 class="text-lg font-semibold text-white">Files</h2>
        <p class="text-sm text-slate-400">Upload supporting documents for the session.</p>
      </div>
    </template>

    <div class="grid gap-3">
      <input ref="fileInput" type="file" class="hidden" @change="onPick" />
      <UButton color="primary" variant="soft" @click="fileInput?.click()">Upload file</UButton>

      <div v-for="file in files" :key="file.filename" class="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/3 px-3 py-2">
        <div>
          <p class="text-sm text-white">{{ file.filename }}</p>
          <p class="text-xs text-slate-400">{{ file.url }}</p>
        </div>
        <UButton size="xs" color="neutral" variant="ghost" @click="$emit('remove', file.filename)">Delete</UButton>
      </div>
    </div>
  </SectionPanel>
</template>

<script setup lang="ts">
import type { DocumentMetadata } from '~/types/openapi'

const fileInput = ref<HTMLInputElement | null>(null)

const props = defineProps<{
  files: DocumentMetadata[]
}>()

const emit = defineEmits<{
  upload: [file: File]
  remove: [filename: string]
}>()

const onPick = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('upload', file)
    target.value = ''
  }
}
</script>
