/**
 * ユーザー設定のデータモデル
 *
 * ゲームの表示や動作に関するユーザー個別の設定を管理します。
 */
export interface UserSettings {
  /**
   * グリッド表示
   * マップのグリッド線を表示するかどうか
   */
  ShowGridLines: boolean;

  /**
   * 戦闘アニメーション
   * 戦闘アニメのON/OFF設定
   */
  EnableBattleAnimation: boolean;
}

/**
 * UserSettings のファクトリ関数
 */
export function createUserSettings(params: Partial<UserSettings> = {}): UserSettings {
  return {
    ShowGridLines: params.ShowGridLines ?? true,
    EnableBattleAnimation: params.EnableBattleAnimation ?? true,
  };
}
