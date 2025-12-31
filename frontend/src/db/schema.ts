import { DB_NAME, DB_VERSION, STORES } from "./types";

/**
 * ObjectStore のインデックス定義
 */
interface IndexDefinition {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

/**
 * ObjectStore の定義
 */
interface StoreDefinition {
  name: string;
  options?: IDBObjectStoreParameters;
  indexes?: IndexDefinition[];
}

/**
 * IndexedDB スキーマ定義
 *
 * 各 ObjectStore の構造とインデックスを定義します。
 */
export const SCHEMA: StoreDefinition[] = [
  // セーブデータ
  {
    name: STORES.SAVE_DATA,
    options: {
      keyPath: ["scenarioId", "slotId"],
    },
    indexes: [
      {
        name: "scenarioId",
        keyPath: "scenarioId",
        options: { unique: false },
      },
      {
        name: "timestamp",
        keyPath: "timestamp",
        options: { unique: false },
      },
    ],
  },

  // シナリオキャッシュ
  {
    name: STORES.SCENARIO_CACHE,
    options: {
      keyPath: "scenarioId",
    },
    indexes: [
      {
        name: "fetchedAt",
        keyPath: "fetchedAt",
        options: { unique: false },
      },
    ],
  },

  // アセットキャッシュ
  {
    name: STORES.ASSET_CACHE,
    options: {
      keyPath: ["scenarioId", "url"],
    },
    indexes: [
      {
        name: "scenarioId",
        keyPath: "scenarioId",
        options: { unique: false },
      },
      {
        name: "expiresAt",
        keyPath: "expiresAt",
        options: { unique: false },
      },
    ],
  },

  // ユーザー設定
  {
    name: STORES.USER_SETTINGS,
    options: {
      keyPath: "key",
    },
  },

  // ダウンロード進捗
  {
    name: STORES.DOWNLOAD_PROGRESS,
    options: {
      keyPath: ["scenarioId", "url"],
    },
    indexes: [
      {
        name: "scenarioId",
        keyPath: "scenarioId",
        options: { unique: false },
      },
      {
        name: "status",
        keyPath: "status",
        options: { unique: false },
      },
      {
        name: "[scenarioId+type]",
        keyPath: ["scenarioId", "type"],
        options: { unique: false },
      },
    ],
  },
];

/**
 * データベース設定
 */
export const DB_CONFIG = {
  name: DB_NAME,
  version: DB_VERSION,
  stores: SCHEMA,
};

/**
 * スキーマのバリデーション
 *
 * スキーマ定義が正しいかチェックします。
 */
export function validateSchema(): boolean {
  const storeNames = new Set<string>();

  for (const store of SCHEMA) {
    // 重複する ObjectStore 名をチェック
    if (storeNames.has(store.name)) {
      console.error(`Duplicate store name: ${store.name}`);
      return false;
    }
    storeNames.add(store.name);

    // インデックスの重複をチェック
    if (store.indexes) {
      const indexNames = new Set<string>();
      for (const index of store.indexes) {
        if (indexNames.has(index.name)) {
          console.error(
            `Duplicate index name in store ${store.name}: ${index.name}`
          );
          return false;
        }
        indexNames.add(index.name);
      }
    }
  }

  return true;
}

/**
 * スキーマ情報を取得します
 */
export function getStoreDefinition(
  storeName: string
): StoreDefinition | undefined {
  return SCHEMA.find((store) => store.name === storeName);
}

/**
 * 全ての ObjectStore 名を取得します
 */
export function getAllStoreNames(): string[] {
  return SCHEMA.map((store) => store.name);
}
