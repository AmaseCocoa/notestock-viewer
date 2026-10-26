export const visibilityLabels = {
  public: '公開',
  unlisted: '未収載',
  followers: 'フォロワー限定',
  direct: 'ダイレクト',
} as const
export type Visibility = keyof typeof visibilityLabels
export interface Post {
  key: string
  boost?: { name: string; handle: string; published: string }
  id: string
  content: string
  summary: string
  published: string
  visibility: Visibility
  searchText: string
  name: string
  handle: string
  avatar: string
  attachments: { url: string; name: string; mediaType: string }[]
  sensitive: boolean
}
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
const string = (value: unknown) => (typeof value === 'string' ? value : '')
const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : typeof value === 'string'
      ? [value]
      : []
export function safeUrl(value: unknown): string {
  try {
    const url = new URL(string(value))
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}
export function cleanHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const allowed = new Set([
    'P',
    'BR',
    'A',
    'SPAN',
    'STRONG',
    'B',
    'EM',
    'I',
    'S',
    'DEL',
    'CODE',
    'PRE',
    'BLOCKQUOTE',
    'UL',
    'OL',
    'LI',
  ])
  for (const element of doc.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH'].includes(element.tagName)) {
      element.remove()
      continue
    }
    if (!allowed.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      continue
    }
    const href = element.tagName === 'A' ? safeUrl(element.getAttribute('href')) : ''
    for (const name of element.getAttributeNames()) element.removeAttribute(name)
    if (href) {
      element.setAttribute('href', href)
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener noreferrer')
    }
  }
  return doc.body.innerHTML
}
export interface ImportLog {
  level: 'warning' | 'error'
  message: string
  json: string
}
export function parsePosts(input: unknown, onLog: (log: ImportLog) => void = () => {}): Post[] {
  if (!Array.isArray(input)) throw new Error('投稿の配列が入ったnotestockのJSONを選んでください。')
  const items = input.map(record)
  const isAnnounce = (item: Record<string, unknown>) =>
    item.type === 'Announce' || typeof item.announce === 'string'
  const targetId = (item: Record<string, unknown>) =>
    string(item.announce) || string(item.object) || string(record(item.object).id)
  const notes = new Map(
    items
      .filter((item) => !isAnnounce(item) && string(item.id))
      .map((item) => [string(item.id), item]),
  )
  const announcedIds = new Set(items.filter(isAnnounce).map(targetId).filter(Boolean))
  return input.flatMap((value, index) => {
    const entry = record(value)
    const announce = isAnnounce(entry)
    if (!announce && announcedIds.has(string(entry.id))) return []
    const target = targetId(entry)
    const item = announce
      ? notes.get(target) || (typeof entry.object === 'object' ? record(entry.object) : {})
      : entry
    const account = record(item.account)
    const log = (level: ImportLog['level'], message: string) =>
      onLog({
        level,
        message: `${index + 1}件目: ${message}`,
        json: JSON.stringify(value, null, 2),
      })
    if (announce && !string(item.id).trim()) {
      log('warning', 'ブーストの本体Noteが見つからないため、無視しました。')
      return []
    }
    if (!string(item.id).trim()) {
      log('error', 'idがないため、投稿を読み取れませんでした。')
      return []
    }
    const to = strings(item.to),
      cc = strings(item.cc)
    const isPublic = (v: string) =>
      v === 'https://www.w3.org/ns/activitystreams#Public' || v === 'as:Public'
    const followers = string(account.followers)
    const visibility: Visibility = to.some(isPublic)
      ? 'public'
      : cc.some(isPublic)
        ? 'unlisted'
        : [...to, ...cc].some((v) => v === followers || v.endsWith('/followers'))
          ? 'followers'
          : 'direct'
    const content = cleanHtml(string(item.content))
    const text = new DOMParser().parseFromString(content, 'text/html').body.textContent || ''
    const name = string(account.name) || string(account.preferredUsername) || '名前なし'
    const handle = string(account.webfinger) || string(item.attributedTo) || string(item.actor)
    const summary = string(item.summary)
    const boostAccount = record(entry.account)
    const boost = announce
      ? {
          name: string(boostAccount.name) || string(boostAccount.preferredUsername) || '名前なし',
          handle: string(boostAccount.webfinger) || string(entry.actor) || string(boostAccount.id),
          published: string(entry.published),
        }
      : undefined
    const post: Post = {
      key: `${announce ? 'announce' : 'note'}:${index}`,
      boost,
      id: string(item.id),
      content,
      summary,
      published: string(item.published),
      visibility,
      searchText: `${text} ${summary} ${name} ${handle} ${boost?.name || ''} ${boost?.handle || ''}`
        .normalize('NFKC')
        .toLocaleLowerCase(),
      name,
      handle,
      avatar: safeUrl(record(account.icon).url),
      sensitive: item.sensitive === true,
      attachments: (Array.isArray(item.attachment) ? item.attachment : [])
        .map((value) => {
          const attachment = record(value)
          return {
            url: safeUrl(attachment.url),
            name: string(attachment.name),
            mediaType: string(attachment.mediaType),
          }
        })
        .filter((a) => a.url),
    }
    if (!text.trim() && !summary.trim() && !post.attachments.length) {
      log('warning', '本文・CW・表示できる添付ファイルがないため、投稿を無視しました。')
      return []
    }
    return [post]
  })
}
export const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '日時不明'
    : new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
