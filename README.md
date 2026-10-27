# notestock viewer

notestock・MisskeyのエクスポートJSONをブラウザー内で読む非公式ビューアーです。Vue 3 / TypeScript / Tailwind CSS 4を使用しています。

## 使い方

```sh
pnpm install
pnpm dev
```

表示された画面からJSONを選択するか、ドロップしてください。動作例はルートの `sample.json` です。投稿をサーバーへ送信せず、永続保存もしません。アイコン・添付画像は元の配信先から取得します。

- 本文・CW・ユーザー名の部分一致検索（スペース区切りのAND検索）
- 公開・未収載・ホーム・フォロワー限定・ダイレクト・指名の絞り込み
- 新しい順／古い順、40件ずつの追加表示
- HTML本文、CW、センシティブ投稿、添付画像、元投稿へのリンク

公開範囲はActivityPubの `to` / `cc` から推定します。独自の宛先やサークルなどは正確に区別できないため、標準の公開・未収載・フォロワー宛てに該当しない投稿はダイレクトに分類します。エクスポート時点のアカウント情報を表示します。本文HTMLの一般的な書式・リンクを残し、スクリプトやイベント属性は除去します。MFM独自の装飾やカスタム絵文字の再現には対応していません。

## Misskey互換モード

`sample.json` のような `text` / `createdAt` を持つMisskeyのエクスポートも自動判別します。notestockのJSONと同時にタブで開き、横断検索できます。

- `text` の改行、`cw`、`files` の添付・センシティブ指定に対応します。MFMはプレーンテキストとして表示します。
- `visibility` は `public`（公開）/ `home`（ホーム）/ `followers`（フォロワー限定）/ `specified`（指名）をそのまま保持します。不明な値は対象JSONとともに左のログへエラーを残します。
- 投稿者情報がないエクスポートでは名前を「自分」と表示します。サーバーURLを含まないidから元投稿のリンクは生成しません。
- 本文のないRenoteは、同じJSONに本体Noteがある場合にまとめて表示します。本体が見つからない場合は警告を残してスキップします。

## ファイル構成

- `src/App.vue`: 全体レイアウト・検索フォーム・一覧
- `src/components/ArchiveImport.vue`: ファイル選択とドロップ
- `src/components/PostCard.vue`: 投稿表示
- `src/composables/useArchive.ts`: 読み込み・検索・絞り込み・表示件数
- `src/lib/posts.ts`: データ型・形式検証・公開範囲の判定・HTML処理
- `src/main.css`: Tailwindと本文のスタイル

`pnpm build` で型検査と本番ビルド、`pnpm lint` でコード検査を実行できます。

## デプロイ

GitHub Pages向けのワークフローは `.github/workflows/deploy.yml` です。リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。

`main` へのpush、またはActions画面からの手動実行で、Node.js 24 / pnpm 12.14.0を使って依存関係を固定インストールし、型検査・ビルド後に `dist` を公開します。公開先のベースパスはPagesの設定から取得するため、リポジトリ配下のURLとカスタムドメインの両方に対応します。追加のシークレット設定は不要です。

制作にLLM（GPT-6.1-Sol）を使用しています。notestockの公式プロジェクトではありません。
