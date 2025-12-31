/**
 * パイロットの特殊技能のデータモデル
 *
 * パイロットが持つ技能を定義します。
 * 例: "切り払い Lv1", "ニュータイプ Lv5"
 */
export interface SkillData {
  /**
   * 技能名
   * 例: "切り払い", "ニュータイプ", "底力"
   */
  Name: string;

  /**
   * 技能のレベル
   */
  Level: number;
}

/**
 * SkillData のファクトリ関数
 */
export function createSkillData(params: Partial<SkillData> = {}): SkillData {
  return {
    Name: params.Name || "",
    Level: params.Level || 1,
  };
}
