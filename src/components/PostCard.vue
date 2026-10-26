<script setup lang="ts">
import { ref } from 'vue'
import {
  IconWorld,
  IconLock,
  IconMail,
  IconLink,
  IconExternalLink,
  IconRepeat,
} from '@tabler/icons-vue'
import { formatDate, safeUrl, visibilityLabels, type Post } from '../lib/posts'
defineProps<{ post: Post }>()
const expanded = ref(false)
const icons = { public: IconWorld, unlisted: IconLink, followers: IconLock, direct: IconMail }
</script>

<template>
  <article class="border-b border-slate-200 bg-white px-5 py-6 sm:px-7">
    <div v-if="post.boost" class="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <IconRepeat :size="16" class="text-teal-700" />
      <span class="break-all" :title="post.boost.handle">{{ post.boost.name }} がブースト</span>
      <time :datetime="post.boost.published">{{ formatDate(post.boost.published) }}</time>
    </div>
    <div class="flex gap-3">
      <img
        v-if="post.avatar"
        :src="post.avatar"
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        class="size-11 shrink-0 rounded-2xl bg-slate-100 object-cover"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div
        v-else
        class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 font-bold text-teal-700"
      >
        {{ post.name.slice(0, 1) }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 class="font-bold text-slate-900">{{ post.name }}</h3>
          <time :datetime="post.published" class="text-xs text-slate-500">{{
            formatDate(post.published)
          }}</time>
        </div>
        <p class="mt-0.5 truncate text-xs text-slate-500">{{ post.handle }}</p>
        <p v-if="post.summary" class="mt-4 whitespace-pre-wrap font-medium">{{ post.summary }}</p>
        <button
          v-if="post.summary || post.sensitive"
          class="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium hover:bg-slate-200"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
        >
          {{ expanded ? '内容を隠す' : '内容を表示' }}
        </button>
        <template v-if="(!post.summary && !post.sensitive) || expanded">
          <div
            v-if="post.content"
            class="post-content mt-4 text-[15px] leading-7 text-slate-700"
            v-html="post.content"
          />
          <div v-if="post.attachments.length" class="mt-4 grid gap-2">
            <a
              v-for="attachment in post.attachments"
              :key="attachment.url"
              :href="attachment.url"
              target="_blank"
              rel="noopener noreferrer"
              class="overflow-hidden rounded-xl border border-slate-200 text-sm text-teal-700"
            >
              <img
                v-if="attachment.mediaType.startsWith('image/')"
                :src="attachment.url"
                :alt="attachment.name"
                loading="lazy"
                referrerpolicy="no-referrer"
                class="max-h-96 w-full object-contain"
              />
              <span v-else class="block p-3">{{ attachment.name || '添付ファイルを開く' }} ↗</span>
            </a>
          </div>
        </template>
        <div class="mt-5 flex items-center justify-between text-xs text-slate-500">
          <span class="flex items-center gap-1.5"
            ><component :is="icons[post.visibility]" :size="14" />{{
              visibilityLabels[post.visibility]
            }}</span
          >
          <a
            v-if="safeUrl(post.id)"
            :href="safeUrl(post.id)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 hover:text-teal-700"
            >元の投稿<IconExternalLink :size="14"
          /></a>
        </div>
      </div>
    </div>
  </article>
</template>
