<script setup lang="ts">
import { ref } from 'vue'
import { IconUpload, IconFileTypeJs } from '@tabler/icons-vue'
defineProps<{ loading: boolean; compact?: boolean }>()
const emit = defineEmits<{ files: [files: File[]] }>()
const input = ref<HTMLInputElement>()
const dragging = ref(false)
function select(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length) emit('files', files)
  target.value = ''
}
function drop(event: DragEvent) {
  dragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length) emit('files', files)
}
</script>
<template>
  <input
    ref="input"
    type="file"
    multiple
    :disabled="loading"
    accept=".json,application/json"
    class="hidden"
    aria-label="エクスポートJSONを選択"
    @change="select"
  />
  <button
    v-if="compact"
    :disabled="loading"
    class="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
    @click="input?.click()"
  >
    <IconUpload :size="18" />{{ loading ? '読み込み中…' : 'JSONを読み込む' }}
  </button>
  <div
    v-else
    class="rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-12"
    :class="dragging ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-slate-50/70'"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="drop"
  >
    <IconFileTypeJs :size="38" stroke="1.4" class="mx-auto mb-5 text-teal-700" />
    <h3 class="text-lg font-bold text-slate-800">投稿の記録を、ここに。</h3>
    <p class="mt-2 text-sm leading-6 text-slate-500">
      notestockからエクスポートした<br class="sm:hidden" />JSONファイルをドロップ
    </p>
    <button
      :disabled="loading"
      class="mt-6 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      @click="input?.click()"
    >
      {{ loading ? '読み込み中…' : 'ファイルを選ぶ' }}
    </button>
    <p class="mt-4 text-xs text-slate-400">.json形式・複数ファイルに対応</p>
  </div>
</template>
