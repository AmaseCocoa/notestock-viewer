import { computed, ref, watch } from 'vue'
import { parsePosts, type ImportLog, type Post, type Visibility } from '../lib/posts'

interface Archive {
  id: string
  filename: string
  posts: Post[]
  logs: ImportLog[]
  error: string
}

export function useArchive() {
  const archives = ref<Archive[]>([])
  const activeId = ref('')
  let nextId = 0
  const selected = computed(() =>
    activeId.value
      ? archives.value.filter((archive) => archive.id === activeId.value)
      : archives.value,
  )
  const posts = computed(() => selected.value.flatMap((archive) => archive.posts))
  const logs = computed(() =>
    selected.value.flatMap((archive) =>
      archive.logs.map((log) => ({ ...log, filename: archive.filename })),
    ),
  )
  const errors = computed(() => selected.value.filter((archive) => archive.error))
  const loading = ref(false)
  const query = ref('')
  const visibility = ref<Visibility | ''>('')
  const order = ref('newest')
  const page = ref(1)
  const filtered = computed(() => {
    const terms = query.value
      .normalize('NFKC')
      .toLocaleLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    return posts.value
      .filter(
        (post) =>
          (!visibility.value || post.visibility === visibility.value) &&
          terms.every((term) => post.searchText.includes(term)),
      )
      .sort(
        (a, b) =>
          ((Date.parse(b.boost?.published || b.published) || 0) -
            (Date.parse(a.boost?.published || a.published) || 0)) *
          (order.value === 'newest' ? 1 : -1),
      )
  })
  const visiblePosts = computed(() => filtered.value.slice(0, page.value * 40))
  watch([query, visibility, order, activeId], () => {
    page.value = 1
  })
  async function loadFiles(files: File[]) {
    if (loading.value || !files.length) return
    loading.value = true
    try {
      for (const file of files) {
        const archive: Archive = {
          id: `archive-${++nextId}`,
          filename: file.name,
          posts: [],
          logs: [],
          error: '',
        }
        try {
          archive.posts = parsePosts(
            JSON.parse((await file.text()).replace(/^\uFEFF/, '')),
            (log) => archive.logs.push(log),
          ).map((post) => ({ ...post, key: `${archive.id}:${post.key}` }))
        } catch (cause) {
          archive.error =
            cause instanceof SyntaxError
              ? 'JSONを読み取れませんでした。ファイルの形式を確認してください。'
              : cause instanceof Error
                ? cause.message
                : '読み込みに失敗しました。'
        }
        archives.value.push(archive)
        activeId.value = files.length === 1 ? archive.id : ''
      }
      page.value = 1
    } finally {
      loading.value = false
    }
  }
  function closeArchive(id: string) {
    archives.value = archives.value.filter((archive) => archive.id !== id)
    if (activeId.value === id) activeId.value = ''
    page.value = 1
  }
  return {
    archives,
    activeId,
    posts,
    errors,
    logs,
    loading,
    query,
    visibility,
    order,
    page,
    filtered,
    visiblePosts,
    loadFiles,
    closeArchive,
  }
}
