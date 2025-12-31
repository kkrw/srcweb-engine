/**
 * Database module index
 *
 * IndexedDB を使用したデータ永続化機能を提供します。
 * Dexie.js を使用して型安全なデータベース操作を実現しています。
 */

// 型定義のエクスポート
export type {
  SaveDataRecord,
  ScenarioCacheRecord,
  AssetCacheRecord,
  UserSettingsRecord,
  DownloadProgressRecord,
} from "./types";

export { DB_NAME, DB_VERSION, STORES } from "./types";

// スキーマ定義のエクスポート
export { DB_CONFIG, SCHEMA, validateSchema, getStoreDefinition, getAllStoreNames } from "./schema";

// データベースインスタンスと初期化関数のエクスポート
export {
  SRCDatabase,
  db,
  initDatabase,
  closeDatabase,
  deleteDatabase,
  checkDatabaseExists,
  clearAllTables,
  getDatabaseStats,
} from "./init";

// バリデーション機能のエクスポート
export * from "./validation";
