/**
 * ホットポイント（クリック可能領域）のデータモデル
 *
 * マップ上のクリック可能な領域を定義します。
 */
export interface HotPoint {
  /**
   * ホットポイントの識別名
   */
  Name: string;

  /**
   * X座標（左端）
   */
  Left: number;

  /**
   * Y座標（上端）
   */
  Top: number;

  /**
   * 幅
   */
  Width: number;

  /**
   * 高さ
   */
  Height: number;

  /**
   * ツールチップ等に表示する名称
   */
  Caption: string;
}

/**
 * HotPoint のファクトリ関数
 */
export function createHotPoint(params: Partial<HotPoint> = {}): HotPoint {
  return {
    Name: params.Name || "",
    Left: params.Left || 0,
    Top: params.Top || 0,
    Width: params.Width || 0,
    Height: params.Height || 0,
    Caption: params.Caption || "",
  };
}
