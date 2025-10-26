# ADR-0002: BullMQ のキュー名はハイフン区切り

## 日付
2025-10-26

## 状況 (Context)
BullMQ のキュー名にコロン `:` を使うと、Redis のキー名と衝突する可能性がある。また、BullMQ は内部的にコロンでキーを区切るため、混乱を招く。

## 決定 (Decision)
キュー名は `search-index` のようにハイフン区切りを採用する。

## 理由 (Rationale)
- Redis のキー名規約との衝突を回避
- BullMQ 公式ドキュメントでもハイフンが推奨されている
- 可読性が高い (`search-index` > `search:index`)

## 影響 (Consequences)
- **メリット**:
  - Redis のキー名が明確になる
  - BullMQ の内部実装との衝突を回避

- **デメリット**:
  - 既存のキュー名を変更する場合、Redis のキーを削除する必要がある
  - コード内のキュー名を統一する手間が発生

- **移行方法**:
  - Redis CLI で `KEYS bull:*` を実行して既存キーを確認
  - 必要に応じて `DEL` コマンドで削除
  - コード内のキュー名を `search-index` に統一
