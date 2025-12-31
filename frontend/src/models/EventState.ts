import type { HotPoint } from "./HotPoint";

/**
 * イベント実行状態のデータモデル
 *
 * イベントスクリプトの実行状態を管理します。
 * 中断セーブや状態復元のために必要な情報を保持します。
 */
export interface EventState {
  /**
   * グローバル変数
   * ユーザー定義変数（フラグ等）を Key-Value 形式で管理
   */
  GlobalVariables: Map<string, string | number>;

  /**
   * ローカル変数
   * イベント実行中の一時変数
   * 中断セーブに含まれます
   */
  LocalVariables: Map<string, string | number>;

  /**
   * イベントラベルの状態
   * 各イベントラベルの有効/無効（Enable）状態
   * 一度しか起きないイベントの管理に使用
   */
  EventLabels: Map<string, boolean>;

  /**
   * 追加イベントファイル名のリスト
   * Require コマンドで動的に読み込まれたイベントファイル
   */
  AdditionalEventFiles: string[];

  /**
   * ホットポイントのリスト
   * マップ上のクリック可能領域
   */
  HotPoints: HotPoint[];

  /**
   * 現在の実行行番号
   * スクリプトのどこまで実行したか
   */
  CurrentLineNum: number;

  /**
   * コールスタック
   * Call コマンドでサブルーチンに飛んでいる場合の戻り先行番号
   */
  CallStack: number[];

  /**
   * 呼び出し階層の深さ
   * 現在のネストの深さ
   */
  CallDepth: number;

  /**
   * 引数スタック
   * サブルーチンに渡された引数の状態
   */
  ArgStack: (string | number)[];

  /**
   * ローカル変数スタック
   * サブルーチン内で定義されたローカル変数の状態
   */
  VarStack: Map<string, string | number>[];

  /**
   * Forループカウンタスタック
   * For ループの現在のカウンタ値
   */
  ForIndexStack: number[];

  /**
   * Forループ上限スタック
   * For ループの終了条件値
   */
  ForLimitStack: number[];

  /**
   * ForEachインデックス
   * ForEach ループの現在位置
   */
  ForEachIndex: number;

  /**
   * ForEachセット
   * ForEach ループで使用しているコレクション
   */
  ForEachSet: string[];
}

/**
 * EventState のファクトリ関数
 */
export function createEventState(params: Partial<EventState> = {}): EventState {
  return {
    GlobalVariables: params.GlobalVariables || new Map(),
    LocalVariables: params.LocalVariables || new Map(),
    EventLabels: params.EventLabels || new Map(),
    AdditionalEventFiles: params.AdditionalEventFiles || [],
    HotPoints: params.HotPoints || [],
    CurrentLineNum: params.CurrentLineNum || 0,
    CallStack: params.CallStack || [],
    CallDepth: params.CallDepth || 0,
    ArgStack: params.ArgStack || [],
    VarStack: params.VarStack || [],
    ForIndexStack: params.ForIndexStack || [],
    ForLimitStack: params.ForLimitStack || [],
    ForEachIndex: params.ForEachIndex || 0,
    ForEachSet: params.ForEachSet || [],
  };
}
