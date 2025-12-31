import type { MapData } from "./MapData";
import type { EventState } from "./EventState";
import { createEventState } from "./EventState";

/**
 * ゲーム全体の進行状況を管理するデータモデル
 *
 * シナリオの進行状態、ターン数、資金などのグローバルな情報を保持します。
 */
export interface GameState {
  /**
   * シナリオファイル名
   * 現在実行中のイベントファイル（.eve）のパス
   */
  ScenarioFileName: string;

  /**
   * フェイズ名
   * 現在のターン進行状態
   * 例: "味方", "敵", "NPC"
   */
  Phase: string;

  /**
   * 次のステージ
   * SetVariableAsString "次ステージ" で管理されるシステム変数
   */
  NextStage: string;

  /**
   * 現在のターン数
   */
  Turn: number;

  /**
   * 総ターン数
   * ゲーム開始からの累計ターン数
   */
  TotalTurn: number;

  /**
   * 総資金
   * プレイヤーが所持している資金
   */
  Money: number;

  /**
   * 読込データセット名のリスト
   * Include コマンドで読み込まれたデータセット名
   * セーブデータの互換性チェックに使用されます
   */
  LoadedDatasets: string[];

  /**
   * 乱数シード
   * 再現性を保証するための乱数シード値
   */
  RndSeed: number;

  /**
   * 乱数位置
   * 乱数系列の現在の参照位置
   */
  RndIndex: number;

  /**
   * 現在のマップデータ
   * ゲーム中のマップ状態を保持します
   */
  CurrentMap: MapData | null;

  /**
   * イベント実行状態
   * イベントスクリプトの実行状態を管理します
   */
  EventState: EventState;
}

/**
 * GameState のファクトリ関数
 */
export function createGameState(params: Partial<GameState> = {}): GameState {
  return {
    ScenarioFileName: params.ScenarioFileName || "",
    Phase: params.Phase || "",
    NextStage: params.NextStage || "",
    Turn: params.Turn || 0,
    TotalTurn: params.TotalTurn || 0,
    Money: params.Money || 0,
    LoadedDatasets: params.LoadedDatasets || [],
    RndSeed: params.RndSeed || 0,
    RndIndex: params.RndIndex || 0,
    CurrentMap: params.CurrentMap || null,
    EventState: params.EventState || createEventState(),
  };
}
