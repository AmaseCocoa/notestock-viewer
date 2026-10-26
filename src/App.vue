<script setup lang="ts">
import {
  IconArchive,
  IconSearch,
  IconX,
  IconShieldLock,
  IconArrowDown,
  IconNotes,
} from '@tabler/icons-vue'
import ArchiveImport from './components/ArchiveImport.vue'
import PostCard from './components/PostCard.vue'
import { useArchive } from './composables/useArchive'
import { visibilityLabels } from './lib/posts'
const {
  posts,
  filename,
  error,
  logs,
  loading,
  query,
  visibility,
  order,
  page,
  filtered,
  visiblePosts,
  loadFile,
  clear,
} = useArchive()
function resetFilters() {
  query.value = ''
  visibility.value = ''
}
</script>

<template>
  <div class="mx-auto min-h-screen max-w-7xl lg:grid lg:grid-cols-[250px_minmax(0,1fr)_260px]">
    <aside
      class="border-b border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-7"
    >
      <a href="./" class="flex items-center gap-3 text-lg font-bold tracking-tight"
        ><span class="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white"
          ><IconArchive :size="23" /></span
        >notestock<span class="text-sm font-normal text-slate-500">viewer</span></a
      >
      <div
        class="mt-9 hidden items-center gap-3 rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 lg:flex"
      >
        <IconNotes :size="19" />投稿アーカイブ
      </div>
      <div class="mt-5 lg:mt-7"><ArchiveImport compact :loading="loading" @file="loadFile" /></div>
      <div v-if="filename" class="mt-5 text-xs leading-6 text-slate-500">
        <p class="break-all">{{ filename }}</p>
        <p>{{ posts.length.toLocaleString() }}件の投稿</p>
        <button
          class="mt-2 text-slate-500 underline underline-offset-4 hover:text-red-700"
          @click="clear"
        >
          読み込んだデータを閉じる
        </button>
      </div>
      <p
        v-if="error"
        role="alert"
        class="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ error }}
      </p>
      <section v-if="logs.length" aria-label="読み込みログ" class="mt-5 space-y-3 text-xs">
        <h2 class="font-semibold text-slate-700">読み込みログ（{{ logs.length }}件）</h2>
        <details
          v-for="(log, index) in logs"
          :key="index"
          class="min-w-0 rounded-lg border p-3"
          :class="
            log.level === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          "
        >
          <summary class="cursor-pointer break-words leading-5">
            {{ log.level === 'error' ? 'エラー' : '警告' }}: {{ log.message }}
          </summary>
          <pre class="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all">{{
            log.json
          }}</pre>
        </details>
      </section>
      <p class="mt-8 hidden text-xs leading-6 text-slate-400 lg:block">
        あなたの投稿を、<br />あなたのペースで振り返る。
      </p>
    </aside>

    <main class="min-w-0 border-slate-200 bg-white lg:border-r">
      <header class="border-b border-slate-200 px-5 py-7 sm:px-7">
        <div class="flex items-center gap-2 text-xs font-medium text-teal-700">
          <span class="size-1.5 rounded-full bg-teal-600" />LOCAL ARCHIVE
        </div>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">投稿アーカイブ</h1>
        <p class="mt-2 text-sm text-slate-500">言葉を探して、あの日を振り返る。</p>
      </header>
      <template v-if="filename">
        <section
          aria-label="投稿を検索・絞り込み"
          class="space-y-4 border-b border-slate-200 p-5 sm:px-7"
        >
          <div class="relative">
            <IconSearch
              :size="19"
              class="pointer-events-none absolute top-3.5 left-3.5 text-slate-400"
            /><input
              v-model="query"
              type="search"
              aria-label="投稿を検索"
              placeholder="投稿やユーザーを検索"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm"
            />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <label for="visibility" class="text-xs text-slate-500">公開範囲</label>
            <select
              id="visibility"
              v-model="visibility"
              class="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs"
            >
              <option value="">すべて</option>
              <option v-for="(label, key) in visibilityLabels" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
            <select
              v-model="order"
              aria-label="投稿の並び順"
              class="ml-auto rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
            </select>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-500" aria-live="polite">
            <span>{{ filtered.length.toLocaleString() }}件の投稿</span
            ><button
              v-if="query || visibility"
              class="flex items-center gap-1 hover:text-teal-700"
              @click="resetFilters"
            >
              <IconX :size="13" />絞り込みを解除
            </button>
          </div>
        </section>
        <div role="feed" aria-label="投稿一覧">
          <PostCard v-for="post in visiblePosts" :key="post.key" :post="post" />
        </div>
        <div v-if="!filtered.length" class="px-6 py-20 text-center">
          <IconSearch class="mx-auto text-slate-300" :size="32" />
          <h2 class="mt-4 font-semibold">
            {{ posts.length ? '一致する投稿がありません' : '投稿がありません' }}
          </h2>
          <p class="mt-2 text-sm text-slate-500">
            {{
              posts.length
                ? 'キーワードや公開範囲を変えてみてください。'
                : '別のJSONファイルを読み込めます。'
            }}
          </p>
        </div>
        <div v-if="visiblePosts.length < filtered.length" class="p-6 text-center">
          <button
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm hover:bg-slate-50"
            @click="page++"
          >
            <IconArrowDown :size="16" />さらに40件表示
          </button>
        </div>
      </template>
      <section v-else class="px-5 py-9 sm:px-7 sm:py-12">
        <ArchiveImport :loading="loading" @file="loadFile" />
        <div class="mt-9 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <h3 class="font-semibold text-slate-800">言葉から探す</h3>
            <p class="mt-2 text-xs leading-6 text-slate-500">
              本文・CW・ユーザー名を検索。スペースで区切ると、すべての言葉を含む投稿を探せます。
            </p>
          </div>
          <div>
            <h3 class="font-semibold text-slate-800">公開範囲で絞る</h3>
            <p class="mt-2 text-xs leading-6 text-slate-500">
              公開・未収載・フォロワー限定・ダイレクト。それぞれの投稿をまとめて振り返れます。
            </p>
          </div>
        </div>
      </section>
      <footer class="border-t border-slate-100 px-5 py-6 text-xs leading-6 text-slate-400 sm:px-7">
        制作にLLM（GPT-6.1-Sol）を使用しています。<br />notestockの非公式ビューアーです。
      </footer>
    </main>

    <aside class="px-6 py-8">
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <IconShieldLock :size="24" stroke="1.5" class="text-teal-700" />
        <h2 class="mt-3 text-sm font-bold">ファイルは手元に</h2>
        <p class="mt-2 text-xs leading-6 text-slate-500">
          JSONはブラウザー内で処理します。サーバーへの送信や、ブラウザーへの永続保存は行いません。
        </p>
        <p class="mt-3 text-xs leading-6 text-slate-500">
          アイコン・添付画像の表示時は、元の配信先へアクセスします。
        </p>
      </div>
      <div class="mt-7 px-1">
        <h2 class="text-xs font-semibold text-slate-700">notestockについて</h2>
        <p class="mt-2 text-xs leading-6 text-slate-500">
          ActivityPub対応SNSの投稿を記録するサービスです。
        </p>
        <a
          href="https://notestock.osa-p.net"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-block text-xs text-teal-700 hover:underline"
          >notestockを開く ↗</a
        >
      </div>
    </aside>
  </div>
</template>
