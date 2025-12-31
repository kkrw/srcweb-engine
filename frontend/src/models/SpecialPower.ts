/**
 * スペシャルパワー（特殊能力）のデータモデル
 *
 * パイロットが習得するスペシャルパワーの定義です。
 * 例: "熱血", "必中", "加速" など
 */
export interface SpecialPower {
  /**
   * スペシャルパワーの名称
   * 例: "熱血", "必中", "加速"
   */
  Name: string;

  /**
   * 習得するパイロットレベル
   */
  RequiredLevel: number;

  /**
   * 使用に必要なSP消費量
   */
  SPCost: number;
}

/**
 * SpecialPower のファクトリ関数
 */
export function createSpecialPower(params: Partial<SpecialPower> = {}): SpecialPower {
  return {
    Name: params.Name || "",
    RequiredLevel: params.RequiredLevel || 1,
    SPCost: params.SPCost || 0,
  };
}
