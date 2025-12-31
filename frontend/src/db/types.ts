import type { GameState } from "../models/GameState";
import type { UnitData } from "../models/UnitData";
import type { PilotData } from "../models/PilotData";

/**
 * セーブデータのレコード型
 *
 * ユーザーのシナリオセーブデータを保持します。
 * 各シナリオごとに複数のスロット（slot1, slot2, slot3, auto）を持つことができます。
 */
export interface SaveDataRecord {
  /**
   * セーブスロット ID
   * 例: "slot1", "slot2", "slot3", "auto", "quick"
   */
  slotId: string;

  /**
   * シナリオ ID
   * どのシナリオのセーブデータか
   */
  scenarioId: string;

  /**
   * 保存日時（UNIX timestamp）
   */
  timestamp: number;

  /**
   * ターン数
   * クイックサマリー表示用
   */
  turn: number;

  /**
   * 削除フラグ
   * 論理削除されたセーブデータ
   */
  deleted: boolean;

  /**
   * ゲーム状態
   * ゲーム全体の進行状況を保持
   */
  gameState: GameState;

  /**
   * ユニット実体データ
   * 現在ゲームに登場している全ユニット
   */
  units: UnitData[];

  /**
   * パイロット実体データ
   * 現在ゲームに登場している全パイロット
   */
  pilots: PilotData[];

  /**
   * サムネイル画像
   * セーブ画面のスクリーンショット（Base64エンコード）
   */
  thumbnail?: string;

  /**
   * メタデータ
   */
  metadata: {
    /**
     * シナリオ名
     */
    scenarioName: string;

    /**
     * プレイ時間（秒）
     */
    playTime: number;

    /**
     * セーブデータのバージョン
     * スキーマ変更時の互換性確保用
     */
    version: number;
  };
}

/**
 * シナリオキャッシュのレコード型
 *
 * プラットフォームから取得したシナリオ定義をローカルにキャッシュして通信を削減します。
 */
export interface ScenarioCacheRecord {
  /**
   * シナリオ ID（主キー）
   */
  scenarioId: string;

  /**
   * シナリオバージョン
   */
  version: string;

  /**
   * 取得日時（UNIX timestamp）
   */
  fetchedAt: number;

  /**
   * シナリオデータ
   * マスターデータ定義全体
   */
  data: {
    /**
     * ユニットマスターデータ
     */
    units: UnitData[];

    /**
     * パイロットマスターデータ
     */
    pilots: PilotData[];

    /**
     * イベント定義
     * テキストファイルの内容
     */
    events: Record<string, string>;

    /**
     * その他のデータファイル
     */
    dataFiles: Record<string, string>;
  };

  /**
   * メタデータ
   */
  metadata: {
    /**
     * シナリオタイトル
     */
    title: string;

    /**
     * 作者名
     */
    author: string;

    /**
     * キャッシュサイズ（バイト）
     */
    size: number;

    /**
     * シナリオ説明
     */
    description?: string;
  };
}

/**
 * アセットキャッシュのレコード型
 *
 * シナリオの実行に必要なアセット（画像、音声等）をローカルにキャッシュします。
 */
export interface AssetCacheRecord {
  /**
   * シナリオ ID（主キーの一部）
   * アセットが属するシナリオ
   */
  scenarioId: string;

  /**
   * アセット URL（主キーの一部）
   * jsDelivr URL 等
   */
  url: string;

  /**
   * アセットタイプ
   */
  type: "image" | "audio" | "data";

  /**
   * バイナリデータ
   */
  blob: Blob;

  /**
   * 取得日時（UNIX timestamp）
   */
  fetchedAt: number;

  /**
   * ファイルサイズ（バイト）
   */
  size: number;

  /**
   * キャッシュ有効期限（UNIX timestamp）
   * 未設定の場合は無期限
   */
  expiresAt?: number;

  /**
   * MIME タイプ
   */
  mimeType: string;
}

/**
 * ユーザー設定のレコード型
 *
 * ユーザーのアプリケーション設定やシナリオごとのゲーム内設定を保持します。
 */
export interface UserSettingsRecord {
  /**
   * 設定キー（主キー）
   * 例: "gameSettings", "uiState", "scenario001:settings"
   */
  key: string;

  /**
   * 設定値
   * JSON シリアライズ可能な任意の値
   */
  value: unknown;

  /**
   * 更新日時（UNIX timestamp）
   */
  updatedAt: number;
}

/**
 * ダウンロード進捗のレコード型
 *
 * アセットファイルのダウンロード状態を管理します。
 */
export interface DownloadProgressRecord {
  /**
   * シナリオ ID（主キーの一部）
   */
  scenarioId: string;

  /**
   * ダウンロード URL（主キーの一部）
   */
  url: string;

  /**
   * ダウンロードタイプ
   * scenario: シナリオ定義ファイル
   * image: 画像アセット
   * audio: 音声アセット
   * data: データファイル
   */
  type: "scenario" | "image" | "audio" | "data";

  /**
   * ダウンロード状態
   */
  status: "pending" | "downloading" | "completed" | "error";

  /**
   * ダウンロード済みバイト数
   */
  downloadedBytes: number;

  /**
   * 総バイト数
   */
  totalBytes: number;

  /**
   * ダウンロード進捗率（0-100）
   */
  progress: number;

  /**
   * ダウンロード開始日時（UNIX timestamp）
   */
  startedAt?: number;

  /**
   * ダウンロード完了日時（UNIX timestamp）
   */
  completedAt?: number;

  /**
   * エラーメッセージ
   */
  error?: string;

  /**
   * 最終更新日時（UNIX timestamp）
   */
  updatedAt: number;
}

/**
 * IndexedDB のデータベース名
 */
export const DB_NAME = "kkrw.srcweb-engine";

/**
 * データベースバージョン
 * スキーマ変更時にインクリメントします
 */
export const DB_VERSION = 1;

/**
 * ObjectStore 名の定数
 */
export const STORES = {
  SAVE_DATA: "saveData",
  SCENARIO_CACHE: "scenarioCache",
  ASSET_CACHE: "assetCache",
  USER_SETTINGS: "userSettings",
  DOWNLOAD_PROGRESS: "downloadProgress",
} as const;
