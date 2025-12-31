/**
 * Database validation module index
 *
 * IndexedDB レコードのランタイムバリデーション機能を提供します。
 * 外部から取得したデータの妥当性を検証するために使用します。
 */

// バリデーションスキーマのエクスポート
export {
  UserSettingsRecordSchema,
  type UserSettingsRecordValidated,
  validateUserSettings,
} from "./UserSettings.schema";

export {
  AssetCacheRecordSchema,
  type AssetCacheRecordValidated,
  validateAssetCache,
} from "./AssetCache.schema";

export {
  DownloadProgressRecordSchema,
  type DownloadProgressRecordValidated,
  validateDownloadProgress,
} from "./DownloadProgress.schema";

export {
  ScenarioCacheRecordSchema,
  type ScenarioCacheRecordValidated,
  validateScenarioCache,
  validateScenarioMetadata,
} from "./ScenarioCache.schema";

export {
  SaveDataRecordSchema,
  type SaveDataRecordValidated,
  validateSaveData,
  validateSaveDataMetadata,
} from "./SaveData.schema";

// ユーティリティ関数のエクスポート
export {
  type ValidationResult,
  type ValidationError,
  formatValidationResult,
  formatErrorMessages,
  validateOrThrow,
  validatePartial,
  validateArray,
  extractSuccessfulData,
  extractValidationErrors,
  validateDBRecord,
} from "./utils";
