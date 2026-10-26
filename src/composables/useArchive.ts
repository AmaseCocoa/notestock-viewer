import { computed, ref, watch } from 'vue'
import { parsePosts, type ImportLog, type Post, type Visibility } from '../lib/posts'

export function useArchive() {
  const posts = ref<Post[]>([])
  const filename = ref('')
  const error = ref('')
  const logs = ref<ImportLog[]>([])
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
  watch([query, visibility, order], () => {
    page.value = 1
  })
  async function loadFile(file: File) {
    loading.value = true
    error.value = ''
    logs.value = []
    try {
      const parsed = parsePosts(JSON.parse((await file.text()).replace(/^\uFEFF/, '')), (log) =>
        logs.value.push(log),
      )
      posts.value = parsed
      filename.value = file.name
      query.value = ''
      visibility.value = ''
      page.value = 1
    } catch (cause) {
      error.value =
        cause instanceof SyntaxError
          ? 'JSONを読み取れませんでした。ファイルの形式を確認してください。'
          : cause instanceof Error
            ? cause.message
            : '読み込みに失敗しました。'
    } finally {
      loading.value = false
    }
  }
  function clear() {
    posts.value = []
    filename.value = ''
    error.value = ''
    logs.value = []
    query.value = ''
    visibility.value = ''
  }
  return {
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
  }
}
