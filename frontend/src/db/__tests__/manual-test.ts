/**
 * IndexedDB マニュアルテストファイル
 *
 * ブラウザの Console で動作確認を行います。
 * 開発時に App.tsx から自動実行されます。
 */

import type { ZodError } from "zod";
import { createGameState } from "../../models/GameState";
import {
  clearAllTables,
  db,
  DB_NAME,
  DB_VERSION,
  getDatabaseStats,
  initDatabase,
  STORES,
  validateAssetCache,
  validateSaveData,
  validateUserSettings,
  type AssetCacheRecord,
  type SaveDataRecord,
  type UserSettingsRecord,
} from "../index";

/**
 * テスト結果の型
 */
interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  error?: Error;
}

/**
 * テスト結果を格納する配列
 */
const testResults: TestResult[] = [];

/**
 * テスト結果を記録します
 */
function logTestResult(
  testName: string,
  passed: boolean,
  message: string,
  error?: Error
): void {
  const result: TestResult = { testName, passed, message, error };
  testResults.push(result);

  const icon = passed ? "✅" : "❌";
  const style = passed
    ? "color: green; font-weight: bold"
    : "color: red; font-weight: bold";

  console.log(`%c${icon} ${testName}`, style);
  console.log(`   ${message}`);

  if (error) {
    console.error("   Error:", error);
  }
}

/**
 * テストセクションの開始をログ出力します
 */
function logTestSection(sectionName: string): void {
  console.log("\n" + "=".repeat(60));
  console.log(
    `%c${sectionName}`,
    "color: blue; font-weight: bold; font-size: 16px"
  );
  console.log("=".repeat(60));
}

/**
 * ZodError からエラーメッセージをフォーマットします
 */
function formatZodError(error: ZodError): string {
  return error.issues
    .map((err) => {
      const path = err.path.length > 0 ? `${err.path.join(".")}: ` : "";
      return `${path}${err.message}`;
    })
    .join(", ");
}

/**
 * 期待されるインデックス定義
 */
const expectedIndexes: Record<string, string[]> = {
  [STORES.SAVE_DATA]: ["scenarioId", "timestamp"],
  [STORES.SCENARIO_CACHE]: ["fetchedAt"],
  [STORES.ASSET_CACHE]: ["scenarioId", "expiresAt"],
  [STORES.USER_SETTINGS]: [],
  [STORES.DOWNLOAD_PROGRESS]: ["scenarioId", "status", "[scenarioId+type]"],
};

/**
 * テスト1: DB初期化とObjectStore/インデックス確認
 */
export async function testDBInitialization(): Promise<void> {
  logTestSection("Test 1: DB Initialization & Schema Verification");

  try {
    // データベースの初期化
    const initialized = await initDatabase();

    if (!initialized) {
      logTestResult(
        "DB Initialization",
        false,
        "Failed to initialize database",
        new Error("initDatabase returned false")
      );
      return;
    }

    logTestResult(
      "DB Initialization",
      true,
      "Database initialized successfully"
    );

    // データベース名の確認
    console.log("\n--- Database Name & Version ---");
    const actualDBName = db.name;
    const actualDBVersion = db.verno;

    if (actualDBName === DB_NAME) {
      logTestResult(
        "Database Name",
        true,
        `Database name is correct: "${actualDBName}"`
      );
    } else {
      logTestResult(
        "Database Name",
        false,
        `Database name mismatch. Expected: "${DB_NAME}", Actual: "${actualDBName}"`
      );
    }

    // データベースバージョンの確認
    if (actualDBVersion === DB_VERSION) {
      logTestResult(
        "Database Version",
        true,
        `Database version is correct: ${actualDBVersion}`
      );
    } else {
      logTestResult(
        "Database Version",
        false,
        `Database version mismatch. Expected: ${DB_VERSION}, Actual: ${actualDBVersion}`
      );
    }

    // ObjectStore の存在確認
    console.log("\n--- ObjectStore Verification ---");
    const expectedStores = Object.values(STORES);
    const actualStores = db.tables.map((table) => table.name);

    let allStoresExist = true;
    for (const storeName of expectedStores) {
      if (actualStores.includes(storeName)) {
        logTestResult(
          `ObjectStore: ${storeName}`,
          true,
          `ObjectStore '${storeName}' exists`
        );
      } else {
        logTestResult(
          `ObjectStore: ${storeName}`,
          false,
          `ObjectStore '${storeName}' not found`
        );
        allStoresExist = false;
      }
    }
    console.log(`All expected ObjectStores exist: ${allStoresExist}`);

    // 全テーブルのインデックスを確認
    console.log("\n--- Index Verification (All Tables) ---");

    for (const storeName of expectedStores) {
      console.log(`\n  Table: ${storeName}`);

      const table = db.table(storeName);
      const schema = table.schema;

      console.log(`    Primary Key: ${JSON.stringify(schema.primKey.keyPath)}`);

      const actualIndexNames = schema.indexes.map((idx) => idx.name);
      console.log(`    Indexes: ${actualIndexNames.join(", ") || "(none)"}`);

      const expectedIndexNames = expectedIndexes[storeName] || [];

      // 期待されるインデックスが全て存在するか確認
      for (const indexName of expectedIndexNames) {
        if (actualIndexNames.includes(indexName)) {
          logTestResult(
            `Index: ${storeName}.${indexName}`,
            true,
            `Index '${indexName}' exists in ${storeName}`
          );
        } else {
          logTestResult(
            `Index: ${storeName}.${indexName}`,
            false,
            `Index '${indexName}' not found in ${storeName}`
          );
        }
      }

      // 予期しないインデックスがないか確認
      for (const indexName of actualIndexNames) {
        if (!expectedIndexNames.includes(indexName)) {
          logTestResult(
            `Index: ${storeName}.${indexName}`,
            false,
            `Unexpected index '${indexName}' found in ${storeName}`
          );
        }
      }

      // インデックス数の確認
      if (actualIndexNames.length === expectedIndexNames.length) {
        logTestResult(
          `Index Count: ${storeName}`,
          true,
          `${storeName} has ${actualIndexNames.length} indexes (expected: ${expectedIndexNames.length})`
        );
      } else {
        logTestResult(
          `Index Count: ${storeName}`,
          false,
          `${storeName} has ${actualIndexNames.length} indexes (expected: ${expectedIndexNames.length})`
        );
      }
    }

    // データベース統計の取得
    console.log("\n--- Database Statistics ---");
    const stats = await getDatabaseStats();
    console.log("Total records:", stats.totalRecords);
    stats.tableStats.forEach((stat) => {
      console.log(`  ${stat.name}: ${stat.count} records`);
    });

    logTestResult(
      "DB Statistics",
      true,
      `Database contains ${stats.totalRecords} total records`
    );
  } catch (error) {
    logTestResult(
      "DB Initialization",
      false,
      "Exception during DB initialization test",
      error as Error
    );
  }
}

/**
 * テスト2: 基本的なCRUD操作テスト
 */
export async function testCRUDOperations(): Promise<void> {
  logTestSection("Test 2: CRUD Operations");

  try {
    // テスト前にテーブルをクリア
    await clearAllTables();
    logTestResult("Clear Tables", true, "All tables cleared before CRUD test");

    // --- CREATE: SaveData の作成 ---
    console.log("\n--- CREATE: SaveData ---");

    const testSaveData: SaveDataRecord = {
      slotId: "test-slot",
      scenarioId: "test-scenario",
      timestamp: Date.now(),
      turn: 42,
      deleted: false,
      gameState: createGameState({
        ScenarioFileName: "test.eve",
        Phase: "味方",
        Turn: 42,
        Money: 10000,
      }),
      units: [],
      pilots: [],
      metadata: {
        scenarioName: "Test Scenario",
        playTime: 3600,
        version: 1,
      },
    };

    await db.saveData.add(testSaveData);
    logTestResult(
      "Create SaveData",
      true,
      "SaveData record created successfully"
    );

    // --- READ: SaveData の読み取り ---
    console.log("\n--- READ: SaveData ---");

    const retrievedSave = await db.saveData.get([
      testSaveData.scenarioId,
      testSaveData.slotId,
    ]);

    if (retrievedSave) {
      logTestResult(
        "Read SaveData",
        true,
        `SaveData retrieved: Turn ${retrievedSave.turn}, Money ${retrievedSave.gameState.Money}`
      );
    } else {
      logTestResult("Read SaveData", false, "SaveData not found");
    }

    // --- UPDATE: SaveData の更新 ---
    console.log("\n--- UPDATE: SaveData ---");

    if (retrievedSave) {
      retrievedSave.turn = 100;
      retrievedSave.gameState.Money = 50000;
      await db.saveData.put(retrievedSave);

      const updatedSave = await db.saveData.get([
        testSaveData.scenarioId,
        testSaveData.slotId,
      ]);

      if (
        updatedSave &&
        updatedSave.turn === 100 &&
        updatedSave.gameState.Money === 50000
      ) {
        logTestResult("Update SaveData", true, "SaveData updated successfully");
      } else {
        logTestResult(
          "Update SaveData",
          false,
          "SaveData update verification failed"
        );
      }
    }

    // --- DELETE: SaveData の削除 ---
    console.log("\n--- DELETE: SaveData ---");

    await db.saveData.delete([testSaveData.scenarioId, testSaveData.slotId]);

    const deletedSave = await db.saveData.get([
      testSaveData.scenarioId,
      testSaveData.slotId,
    ]);

    if (!deletedSave) {
      logTestResult("Delete SaveData", true, "SaveData deleted successfully");
    } else {
      logTestResult(
        "Delete SaveData",
        false,
        "SaveData still exists after deletion"
      );
    }

    // --- CREATE: UserSettings の作成 ---
    console.log("\n--- CREATE: UserSettings ---");

    const testSettings: UserSettingsRecord = {
      key: "test-settings",
      value: { theme: "dark", language: "ja" },
      updatedAt: Date.now(),
    };

    await db.userSettings.add(testSettings);
    logTestResult("Create UserSettings", true, "UserSettings record created");

    // --- READ: UserSettings の読み取り ---
    const retrievedSettings = await db.userSettings.get(testSettings.key);

    if (retrievedSettings) {
      logTestResult(
        "Read UserSettings",
        true,
        `UserSettings retrieved: ${JSON.stringify(retrievedSettings.value)}`
      );
    } else {
      logTestResult("Read UserSettings", false, "UserSettings not found");
    }

    // --- CREATE: AssetCache の作成 ---
    console.log("\n--- CREATE: AssetCache ---");

    const testAsset: AssetCacheRecord = {
      scenarioId: "test-scenario",
      url: "https://example.com/test.png",
      type: "image",
      blob: new Blob(["test data"], { type: "image/png" }),
      fetchedAt: Date.now(),
      size: 9,
      mimeType: "image/png",
    };

    await db.assetCache.add(testAsset);
    logTestResult("Create AssetCache", true, "AssetCache record created");

    // --- READ: AssetCache の読み取り ---
    const retrievedAsset = await db.assetCache.get([
      testAsset.scenarioId,
      testAsset.url,
    ]);

    if (retrievedAsset) {
      logTestResult(
        "Read AssetCache",
        true,
        `AssetCache retrieved: ${retrievedAsset.type}, ${retrievedAsset.size} bytes`
      );
    } else {
      logTestResult("Read AssetCache", false, "AssetCache not found");
    }

    // インデックスを使用したクエリのテスト
    console.log("\n--- Query by Index ---");

    const assetsByScenario = await db.assetCache
      .where("scenarioId")
      .equals("test-scenario")
      .toArray();

    logTestResult(
      "Query by Index",
      assetsByScenario.length === 1,
      `Found ${assetsByScenario.length} assets for test-scenario`
    );
  } catch (error) {
    logTestResult(
      "CRUD Operations",
      false,
      "Exception during CRUD operations test",
      error as Error
    );
  }
}

/**
 * テスト3: Zodバリデーションのテスト
 */
export async function testZodValidation(): Promise<void> {
  logTestSection("Test 3: Zod Validation");

  try {
    // --- 有効なデータのバリデーション ---
    console.log("\n--- Valid Data Validation ---");

    const validSaveData: SaveDataRecord = {
      slotId: "slot1",
      scenarioId: "scenario001",
      timestamp: Date.now(),
      turn: 10,
      deleted: false,
      gameState: createGameState(),
      units: [],
      pilots: [],
      metadata: {
        scenarioName: "Valid Scenario",
        playTime: 1800,
        version: 1,
      },
    };

    const validResult = validateSaveData(validSaveData);

    if (validResult.success) {
      logTestResult(
        "Validate Valid SaveData",
        true,
        "Valid SaveData passed validation"
      );
    } else {
      logTestResult(
        "Validate Valid SaveData",
        false,
        `Validation failed: ${formatZodError(validResult.error)}`
      );
    }

    // --- 無効なデータのバリデーション ---
    console.log("\n--- Invalid Data Validation ---");

    const invalidSaveData = {
      slotId: "", // 空文字列（エラーになるべき）
      scenarioId: "scenario001",
      timestamp: -1, // 負の数（エラーになるべき）
      turn: 10,
      deleted: false,
      gameState: {},
      units: [],
      pilots: [],
      metadata: {
        scenarioName: "Invalid Scenario",
        playTime: -100, // 負の数（エラーになるべき）
        version: 1,
      },
    };

    const invalidResult = validateSaveData(invalidSaveData);

    if (!invalidResult.success) {
      logTestResult(
        "Validate Invalid SaveData",
        true,
        `Correctly detected ${invalidResult.error.issues.length} validation errors`
      );

      console.log("--- Validation Errors ---");
      invalidResult.error.issues.forEach((error, index) => {
        console.log(
          `  ${index + 1}. ${error.path.join(".")}: ${error.message}`
        );
      });
    } else {
      logTestResult(
        "Validate Invalid SaveData",
        false,
        "Invalid data passed validation (should have failed)"
      );
    }

    // --- UserSettings のバリデーション ---
    console.log("\n--- UserSettings Validation ---");

    const validSettings: UserSettingsRecord = {
      key: "settings-key",
      value: { theme: "dark" },
      updatedAt: Date.now(),
    };

    const settingsResult = validateUserSettings(validSettings);

    if (settingsResult.success) {
      logTestResult(
        "Validate UserSettings",
        true,
        "Valid UserSettings passed validation"
      );
    } else {
      logTestResult(
        "Validate UserSettings",
        false,
        `Validation failed: ${formatZodError(settingsResult.error)}`
      );
    }

    // --- AssetCache のバリデーション ---
    console.log("\n--- AssetCache Validation ---");

    const validAsset: AssetCacheRecord = {
      scenarioId: "scenario001",
      url: "https://example.com/asset.png",
      type: "image",
      blob: new Blob(["data"], { type: "image/png" }),
      fetchedAt: Date.now(),
      size: 1024,
      mimeType: "image/png",
    };

    const assetResult = validateAssetCache(validAsset);

    if (assetResult.success) {
      logTestResult(
        "Validate AssetCache",
        true,
        "Valid AssetCache passed validation"
      );
    } else {
      logTestResult(
        "Validate AssetCache",
        false,
        `Validation failed: ${formatZodError(assetResult.error)}`
      );
    }

    // --- 型が間違っているデータのバリデーション ---
    console.log("\n--- Type Error Validation ---");

    const typeErrorAsset = {
      scenarioId: "scenario001",
      url: "not-a-valid-url", // 無効なURL
      type: "invalid-type", // 無効なタイプ（"image", "audio", "data" 以外）
      blob: "not-a-blob", // Blob ではない
      fetchedAt: Date.now(),
      size: 1024,
      mimeType: "image/png",
    };

    const typeErrorResult = validateAssetCache(typeErrorAsset);

    if (!typeErrorResult.success) {
      logTestResult(
        "Validate Type Error AssetCache",
        true,
        `Correctly detected ${typeErrorResult.error.issues.length} type errors`
      );

      console.log("--- Type Errors ---");
      typeErrorResult.error.issues.forEach((error, index) => {
        console.log(
          `  ${index + 1}. ${error.path.join(".")}: ${error.message}`
        );
      });
    } else {
      logTestResult(
        "Validate Type Error AssetCache",
        false,
        "Type error data passed validation (should have failed)"
      );
    }
  } catch (error) {
    logTestResult(
      "Zod Validation",
      false,
      "Exception during Zod validation test",
      error as Error
    );
  }
}

/**
 * 全てのテストを実行します
 */
export async function runAllTests(): Promise<void> {
  console.clear();
  console.log(
    "%c🧪 IndexedDB Manual Tests Starting...",
    "color: purple; font-weight: bold; font-size: 20px"
  );
  console.log("Open the browser console to view detailed results.\n");

  testResults.length = 0; // テスト結果をリセット

  try {
    await testDBInitialization();
    await testCRUDOperations();
    await testZodValidation();

    // 最終結果のサマリー
    logTestSection("Test Summary");

    const totalTests = testResults.length;
    const passedTests = testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`%cPassed: ${passedTests}`, "color: green; font-weight: bold");
    console.log(`%cFailed: ${failedTests}`, "color: red; font-weight: bold");

    if (failedTests > 0) {
      console.log("\n--- Failed Tests ---");
      testResults
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`❌ ${r.testName}: ${r.message}`);
        });
    }

    const allPassed = failedTests === 0;
    const icon = allPassed ? "✅" : "❌";
    const message = allPassed ? "All tests passed!" : "Some tests failed.";
    const style = allPassed
      ? "color: green; font-weight: bold; font-size: 18px"
      : "color: red; font-weight: bold; font-size: 18px";

    console.log(`\n%c${icon} ${message}`, style);
  } catch (error) {
    console.error("Fatal error during test execution:", error);
  }
}
