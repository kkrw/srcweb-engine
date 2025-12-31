import Dexie, { type EntityTable, type Table } from "dexie";
import type {
  AssetCacheRecord,
  DownloadProgressRecord,
  SaveDataRecord,
  ScenarioCacheRecord,
  UserSettingsRecord,
} from "./types";
import { DB_NAME, DB_VERSION, STORES } from "./types";

/**
 * SRC Web Engine Database
 *
 * IndexedDB データベースのクラス定義。
 * Dexie.js を使用して型安全なデータベース操作を提供します。
 */
export class SRCDatabase extends Dexie {
  /**
   * セーブデータテーブル
   */
  saveData!: Table<SaveDataRecord, [string, string]>;

  /**
   * シナリオキャッシュテーブル
   */
  scenarioCache!: EntityTable<ScenarioCacheRecord, "scenarioId">;

  /**
   * アセットキャッシュテーブル
   */
  assetCache!: Table<AssetCacheRecord, [string, string]>;

  /**
   * ユーザー設定テーブル
   */
  userSettings!: EntityTable<UserSettingsRecord, "key">;

  /**
   * ダウンロード進捗テーブル
   */
  downloadProgress!: Table<DownloadProgressRecord, [string, string]>;

  constructor() {
    super(DB_NAME);

    // スキーマ定義（バージョン 1）
    this.version(DB_VERSION).stores({
      // セーブデータ
      // 主キー: [scenarioId, slotId]
      // インデックス: scenarioId, timestamp
      [STORES.SAVE_DATA]: "[scenarioId+slotId], scenarioId, timestamp",

      // シナリオキャッシュ
      // 主キー: scenarioId
      // インデックス: fetchedAt
      [STORES.SCENARIO_CACHE]: "scenarioId, fetchedAt",

      // アセットキャッシュ
      // 主キー: [scenarioId, url]
      // インデックス: scenarioId, expiresAt
      [STORES.ASSET_CACHE]: "[scenarioId+url], scenarioId, expiresAt",

      // ユーザー設定
      // 主キー: key
      [STORES.USER_SETTINGS]: "key",

      // ダウンロード進捗
      // 主キー: [scenarioId, url]
      // インデックス: scenarioId, status, [scenarioId+type]
      [STORES.DOWNLOAD_PROGRESS]:
        "[scenarioId+url], scenarioId, status, [scenarioId+type]",
    });
  }
}

/**
 * データベースのシングルトンインスタンス
 */
export const db = new SRCDatabase();

/**
 * データベースを初期化します
 *
 * データベースのオープンと接続確認を行います。
 *
 * @returns 初期化が成功したかを示す Promise
 */
export async function initDatabase(): Promise<boolean> {
  try {
    // データベースを開く
    await db.open();

    console.log(
      `Database "${DB_NAME}" version ${DB_VERSION} opened successfully`
    );

    // 接続確認のため、テーブルの存在をチェック
    const tableNames = db.tables.map((table) => table.name);
    console.log(`Available tables: ${tableNames.join(", ")}`);

    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
}

/**
 * データベースを閉じます
 */
export async function closeDatabase(): Promise<void> {
  await db.close();
  console.log(`Database "${DB_NAME}" closed`);
}

/**
 * データベースを削除します（開発/テスト用）
 *
 * @returns 削除が成功したかを示す Promise
 */
export async function deleteDatabase(): Promise<boolean> {
  try {
    await db.delete();
    console.log(`Database "${DB_NAME}" deleted successfully`);
    return true;
  } catch (error) {
    console.error("Failed to delete database:", error);
    return false;
  }
}

/**
 * データベースが存在するかチェックします
 *
 * @returns データベースが存在するかを示す Promise
 */
export async function checkDatabaseExists(): Promise<boolean> {
  try {
    return await Dexie.exists(DB_NAME);
  } catch (error) {
    console.error("Failed to check database existence:", error);
    return false;
  }
}

/**
 * 全てのテーブルをクリアします（開発/テスト用）
 */
export async function clearAllTables(): Promise<void> {
  await db.transaction("rw", db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
      console.log(`Cleared table: ${table.name}`);
    }
  });
  console.log("All tables cleared");
}

/**
 * データベースの統計情報を取得します
 */
export async function getDatabaseStats(): Promise<{
  tableStats: Array<{ name: string; count: number }>;
  totalRecords: number;
}> {
  const tableStats = await Promise.all(
    db.tables.map(async (table) => ({
      name: table.name,
      count: await table.count(),
    }))
  );

  const totalRecords = tableStats.reduce((sum, stat) => sum + stat.count, 0);

  return { tableStats, totalRecords };
}
