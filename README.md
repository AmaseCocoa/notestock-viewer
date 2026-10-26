# notestock viewer

notestockのエクスポートJSONをブラウザー内で読む非公式ビューアーです。Vue 3 / TypeScript / Tailwind CSS 4を使用しています。

## 使い方

```sh
pnpm install
pnpm dev
```

表示された画面からJSONを選択するか、ドロップしてください。動作例はルートの `sample.json` です。投稿をサーバーへ送信せず、永続保存もしません。アイコン・添付画像は元の配信先から取得します。

- 本文・CW・ユーザー名の部分一致検索（スペース区切りのAND検索）
- 公開・未収載・フォロワー限定・ダイレクトの絞り込み
- 新しい順／古い順、40件ずつの追加表示
- HTML本文、CW、センシティブ投稿、添付画像、元投稿へのリンク

公開範囲はActivityPubの `to` / `cc` から推定します。独自の宛先やサークルなどは正確に区別できないため、標準の公開・未収載・フォロワー宛てに該当しない投稿はダイレクトに分類します。エクスポート時点のアカウント情報を表示します。本文HTMLの一般的な書式・リンクを残し、スクリプトやイベント属性は除去します。MFM独自の装飾やカスタム絵文字の再現には対応していません。

## ファイル構成

- `src/App.vue`: 全体レイアウト・検索フォーム・一覧
- `src/components/ArchiveImport.vue`: ファイル選択とドロップ
- `src/components/PostCard.vue`: 投稿表示
- `src/composables/useArchive.ts`: 読み込み・検索・絞り込み・表示件数
- `src/lib/posts.ts`: データ型・形式検証・公開範囲の判定・HTML処理
- `src/main.css`: Tailwindと本文のスタイル

`pnpm build` で型検査と本番ビルド、`pnpm lint` でコード検査を実行できます。

制作にLLM（GPT-6.1-Sol）を使用しています。notestockの公式プロジェクトではありません。
