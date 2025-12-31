/**
 * マップのセル（タイル）のデータモデル
 *
 * マップの各グリッド（セル）の地形情報を管理します。
 */
export interface MapCell {
  /**
   * X座標
   */
  X: number;

  /**
   * Y座標
   */
  Y: number;

  /**
   * 地形ID
   */
  TerrainID: number;

  /**
   * 地形画像のバリエーション番号
   */
  BitmapNo: number;

  /**
   * 上層レイヤーの地形ID
   * null または 0 の場合は上層なし
   */
  LayerTerrainID: number | null;

  /**
   * 上層レイヤー画像番号
   * null または 0 の場合は上層なし
   */
  LayerBitmapNo: number | null;

  /**
   * マスの属性
   * 上層/下層/画像のみ等の区分
   */
  BoxType: number;
}

/**
 * マップ（Map）のデータモデル
 *
 * 現在プレイ中のマップ（グリッド、地形、配置）の状態を保持します。
 */
export interface MapData {
  /**
   * マップファイル名
   * 現在読み込まれているマップ定義ファイル（.map）のパス
   */
  MapFileName: string;

  /**
   * マップ横幅
   * マップのグリッド数（X軸）
   */
  Width: number;

  /**
   * マップ縦幅
   * マップのグリッド数（Y軸）
   */
  Height: number;

  /**
   * マップセルの配列
   * 全てのマップセル（タイル）の情報を保持します
   */
  Cells: MapCell[];

  /**
   * 描画モード
   * 例: "夜", "夕焼け", "セピア" 等の画面効果状態
   */
  DrawMode: string;

  /**
   * フィルタ色
   * 画面全体にかけるフィルタの色コード
   */
  FilterColor: number;

  /**
   * フィルタ透過度
   * フィルタの強さ（0-100%）
   */
  FilterTransparency: number;
}

/**
 * MapCell のファクトリ関数
 */
export function createMapCell(params: Partial<MapCell> = {}): MapCell {
  return {
    X: params.X || 0,
    Y: params.Y || 0,
    TerrainID: params.TerrainID || 0,
    BitmapNo: params.BitmapNo || 0,
    LayerTerrainID: params.LayerTerrainID ?? null,
    LayerBitmapNo: params.LayerBitmapNo ?? null,
    BoxType: params.BoxType || 0,
  };
}

/**
 * MapData のファクトリ関数
 */
export function createMapData(params: Partial<MapData> = {}): MapData {
  return {
    MapFileName: params.MapFileName || "",
    Width: params.Width || 0,
    Height: params.Height || 0,
    Cells: params.Cells || [],
    DrawMode: params.DrawMode || "",
    FilterColor: params.FilterColor || 0,
    FilterTransparency: params.FilterTransparency || 0,
  };
}

/**
 * 指定座標のマップセルを取得します
 *
 * TODO: パフォーマンス最適化
 * 現在の実装は配列の全走査を行うため、大きなマップでは非効率です。
 * 以下の方法を検討してください:
 * 1. 二次元配列 (MapCell[][]) による O(1) アクセス
 * 2. Map<string, MapCell> (キー: `${x},${y}`) によるハッシュマップ
 * 3. Cells を Width × Height の固定長配列にして index = y * Width + x でアクセス
 */
export function getCell(map: MapData, x: number, y: number): MapCell | undefined {
  return map.Cells.find((cell) => cell.X === x && cell.Y === y);
}

/**
 * 指定座標のマップセルを設定します
 *
 * TODO: パフォーマンス最適化
 * 現在の実装は配列の全走査を行うため、大きなマップでは非効率です。
 * getCell() と同様に、二次元配列や Map による実装を検討してください。
 */
export function setCell(map: MapData, cell: MapCell): void {
  const index = map.Cells.findIndex((c) => c.X === cell.X && c.Y === cell.Y);
  if (index !== -1) {
    map.Cells[index] = cell;
  } else {
    map.Cells.push(cell);
  }
}
