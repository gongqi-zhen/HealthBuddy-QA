# HealthBuddy-QA

### Inspiration

第 24 回 JAPAN ドラッグストアショー で、ドラッグストア業界の健康生活拠点（健活ステーション）化への取り組みを目の当たりにし、セルフメディケーションの促進やインバウンド需要の取り込みなど、多様なニーズへの対応を支援する AI アプリの必要性を感じた。

### What it does

健康に関する質問に答えることができる AI アプリです。３つの機能を持ちます。

- スマートドライブ

  専門知識をドキュメント QA に提供します。PDF ファイルを事前にアップロードして利用します。

- ドキュメント QA

  健康に関する質問に答えることができます。
  ユーザーの健康診断結果や測定機器のデータ（例: 血圧値）をもとに、特定保健用食品を推奨します。

- 翻訳

  多くの人に利用いただけるように、翻訳機能を提供します。

### Challenges we ran into

- 社会につながるテーマを見つけること。
- Google Cloud の AI サービスを使った開発経験が不足していたこと。

### Accomplishments that we're proud of

AI Hackathon に挑戦し、締め切りまでに成果をまとめ上げられたこと。

### What we learned

- 生成 AI を使ったアプリ開発の基本的な技術
- 今後登場する様々な生成 AI への対応準備
- Youtube への動画公開方法
- 参考

  書籍: Google Cloud で学ぶ生成 AI アプリ開発入門
  ソースコード & blog : https://github.com/google-cloud-japan/sa-ml-workshop
  Zenn(Vertex AI, Gemini): https://zenn.dev/p/google_cloud_jp

### What's next for HealthBuddy-QA

健康診断結果の活用
フォーマットが異なる健康診断結果を AI で処理し、より多くの検査項目に対応できるように
セルフメディケーション活動に関心が高い方に、お得になる仕組みを導入する

## 概要

このアプリケーションは、ユーザーの健康診断結果や測定機器のデータ（例: 血圧値）をもとに、個別に最適な特定保健用食品を推奨します。
データを分析し、健康状態の改善に役立つ情報を提供することで、ユーザーの健康維持をサポートします。

### [AI Hackathon with Google Cloud](https://googlecloudjapanaihackathon.devpost.com/)

### [サービス URL](https://healthbuddy-qa-frontend-service-658068769407.asia-northeast1.run.app/)

### プロジェクトのデモ動画

[![プロジェクトの3分以内のデモ動画](https://github.com/user-attachments/assets/2c816ee8-7789-408e-bc69-a5eeeed448f3)](https://youtu.be/9sehDtx48j4)

### [システムアーキテクチャ図](https://docs.google.com/presentation/d/1m8mq8HTRIOBMtdxCmtxbUD929ImGD4Ng5E-4NHmQb_8/edit#slide=id.g2895b56caaa_0_0)

### Google Cloud AI、コンピュートプロダクト

Google Cloud AI プロダクト

- Vertex AI Platform
- Vertex AI Notebooks

Google Cloud コンピュート プロダクト

- Cloud Run
- Google Compute Engine

### [注意事項](https://github.com/gongqi-zhen/HealthBuddy-QA/blob/main/docs/notes.md)
