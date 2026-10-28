<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { exportPosts, type Post } from '../lib/posts'

const props = defineProps<{
  archives: { id: string; filename: string; posts: Post[]; error: string }[]
}>()
const selectedIds = ref<string[]>([])
watch(
  () => props.archives.map((archive) => archive.id),
  (ids, previous = []) => {
    selectedIds.value = [
      ...selectedIds.value.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !previous.includes(id)),
    ]
  },
  { immediate: true },
)
const posts = computed(() =>
  props.archives.flatMap((archive) =>
    selectedIds.value.includes(archive.id) ? archive.posts : [],
  ),
)
function download() {
  const blob = new Blob([JSON.stringify(exportPosts(posts.value), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'posts.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <section class="mt-6 rounded-xl border border-slate-200 p-4" aria-label="JSON書き出し">
    <h2 class="text-sm font-semibold text-slate-800">解析用JSONを書き出す</h2>
    <p class="mt-2 text-xs leading-5 text-slate-500">
      投稿日・本文・公開範囲のみ。検索や表示の絞り込みにかかわらず、選んだファイルの全投稿を含めます。
    </p>
    <div class="mt-3 space-y-2">
      <label
        v-for="archive in archives"
        :key="archive.id"
        class="flex items-start gap-2 text-xs leading-5 text-slate-600"
      >
        <input
          v-model="selectedIds"
          type="checkbox"
          :value="archive.id"
          :disabled="!!archive.error"
          class="mt-1 accent-teal-700"
        />
        <span class="min-w-0 break-all">{{ archive.filename }}</span>
      </label>
    </div>
    <p class="mt-3 text-xs leading-5 text-slate-500">
      日時はUTC、本文は装飾なし。ホームは未収載、指名はダイレクトに統一します。CW・添付は含みません。
    </p>
    <button
      :disabled="!posts.length"
      class="mt-3 w-full rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      @click="download"
    >
      {{ posts.length.toLocaleString() }}件をJSONで保存
    </button>
  </section>
</template>
