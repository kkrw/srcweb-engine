# Database Validation

IndexedDB レコードのランタイムバリデーション機能を提供します。
外部から取得したデータ（セーブデータ、シナリオキャッシュ、アセット等）の妥当性を検証するために使用します。

## 概要

このモジュールは [Zod](https://zod.dev/) を使用して、IndexedDB から取得したデータのランタイムバリデーションを行います。

### なぜバリデーションが必要か？

1. **外部データは信頼できない**
   - ユーザーのブラウザに保存されたデータは、バージョン違い・破損・悪意ある改変の可能性がある
   - シナリオファイルは外部サーバーから取得するため検証必須

2. **スキーマ変更への対応**
   - アプリケーションのバージョンアップ時に、古い形式のデータを検出できる
   - 適切なマイグレーション処理を実行できる

3. **デバッグの容易化**
   - データの不整合を早期に発見できる
   - エラーメッセージで問題箇所を特定できる

## 使用方法

### 基本的な使用例

```typescript
import { db, validateSaveData } from "@/db";

// IndexedDB からセーブデータを取得
const rawData = await db.saveData.get(["scenario001", "slot1"]);

// バリデーション実行
const result = validateSaveData(rawData);

if (result.success) {
  // バリデーション成功
  const saveData = result.data;
  console.log(`Turn: ${saveData.turn}`);
} else {
  // バリデーション失敗
  console.error("Invalid save data:", result.errors);
  result.errors.forEach((error) => {
    console.error(`${error.path.join(".")}: ${error.message}`);
  });
}
```

### 例外をスローする方法

バリデーション失敗時に例外をスローしたい場合：

```typescript
import { db, SaveDataRecordSchema, validateOrThrow } from "@/db";

try {
  const rawData = await db.saveData.get(["scenario001", "slot1"]);
  const saveData = validateOrThrow(
    SaveDataRecordSchema,
    rawData,
    "Failed to load save data"
  );

  // バリデーション成功時の処理
  console.log(`Loaded save data: ${saveData.metadata.scenarioName}`);
} catch (error) {
  // バリデーション失敗時の処理
  console.error(error);
}
```

### 配列データのバリデーション

複数のレコードを一括でバリデーションする場合：

```typescript
import { db, AssetCacheRecordSchema, validateArray, extractSuccessfulData } from "@/db";

// シナリオの全アセットを取得
const assets = await db.assetCache
  .where("scenarioId")
  .equals("scenario001")
  .toArray();

// 一括バリデーション
const results = validateArray(AssetCacheRecordSchema, assets);

// 成功したデータのみを抽出
const validAssets = extractSuccessfulData(results);
console.log(`Valid assets: ${validAssets.length} / ${assets.length}`);
```

### メタデータのみのバリデーション

詳細データを除外した軽量なバリデーションを行う場合：

```typescript
import { validateSaveDataMetadata } from "@/db";

// セーブデータの一覧表示用に、メタデータのみを検証
const result = validateSaveDataMetadata(rawData);

if (result.success) {
  const { scenarioId, slotId, turn, metadata } = result.data;
  console.log(`${metadata.scenarioName} - Turn ${turn}`);
}
```

### DB レコード専用のヘルパー

`undefined` や `null` を適切にハンドリングする場合：

```typescript
import { db, UserSettingsRecordSchema, validateDBRecord } from "@/db";

const rawData = await db.userSettings.get("gameSettings");

// データが存在しない場合も適切にエラーを返す
const result = validateDBRecord(UserSettingsRecordSchema, rawData, "User settings");

if (!result.success) {
  console.error("Settings not found or invalid:", result.errors);
}
```

## バリデーションスキーマ一覧

### SaveDataRecord

セーブデータのバリデーション。

```typescript
import { validateSaveData } from "@/db";
```

### ScenarioCacheRecord

シナリオキャッシュのバリデーション。

```typescript
import { validateScenarioCache, validateScenarioMetadata } from "@/db";
```

### AssetCacheRecord

アセットキャッシュのバリデーション。

```typescript
import { validateAssetCache } from "@/db";
```

### UserSettingsRecord

ユーザー設定のバリデーション。

```typescript
import { validateUserSettings } from "@/db";
```

### DownloadProgressRecord

ダウンロード進捗のバリデーション。

```typescript
import { validateDownloadProgress } from "@/db";
```

## TODO: 詳細なバリデーションの追加

現在、以下のフィールドは `unknown` として定義されています。
将来的に、より詳細なバリデーションスキーマを追加することを推奨します：

- `SaveDataRecord.gameState` → `GameStateSchema`
- `SaveDataRecord.units` → `UnitDataSchema[]`
- `SaveDataRecord.pilots` → `PilotDataSchema[]`
- `ScenarioCacheRecord.data.units` → `UnitDataSchema[]`
- `ScenarioCacheRecord.data.pilots` → `PilotDataSchema[]`

これらのスキーマは、内部モデルの実装が安定してから作成することを推奨します。

## ベストプラクティス

1. **IndexedDB からの読み込み時は必ずバリデーション**
   ```typescript
   // 悪い例
   const data = await db.saveData.get(key);
   console.log(data.turn); // data が undefined の可能性

   // 良い例
   const rawData = await db.saveData.get(key);
   const result = validateDBRecord(SaveDataRecordSchema, rawData, "Save data");
   if (result.success) {
     console.log(result.data.turn);
   }
   ```

2. **エラーハンドリングを適切に行う**
   ```typescript
   if (!result.success) {
     // ユーザーに分かりやすいエラーメッセージを表示
     const message = formatErrorMessages(result.errors);
     showErrorDialog("データの読み込みに失敗しました", message);

     // ログに詳細を記録
     console.error("Validation errors:", result.errors);
   }
   ```

3. **パフォーマンスを考慮する**
   - 大量のデータを検証する場合は、メタデータのみのバリデーションを使用
   - 必要に応じて、詳細データは後から検証

## 参考リンク

- [Zod Documentation](https://zod.dev/)
- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
