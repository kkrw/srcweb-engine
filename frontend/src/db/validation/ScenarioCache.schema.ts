import { z } from "zod";

/**
 * シナリオデータの Zod バリデーションスキーマ
 *
 * マスターデータ定義全体を検証します。
 */
const ScenarioDataSchema = z.object({
  // TODO: UnitData の詳細なバリデーションスキーマを追加
  // 現在は unknown で許容していますが、UnitDataSchema を作成して適用することを推奨
  units: z.array(z.unknown()),

  // TODO: PilotData の詳細なバリデーションスキーマを追加
  // 現在は unknown で許容していますが、PilotDataSchema を作成して適用することを推奨
  pilots: z.array(z.unknown()),

  events: z.record(z.string(), z.string()), // イベント定義（ファイル名 -> 内容）
  dataFiles: z.record(z.string(), z.string()), // その他のデータファイル
});

/**
 * ScenarioCacheRecord の Zod バリデーションスキーマ
 *
 * シナリオキャッシュデータのランタイム検証を行います。
 */
export const ScenarioCacheRecordSchema = z.object({
  scenarioId: z.string().min(1, "scenarioId is required"),
  version: z.string().min(1, "version is required"),
  fetchedAt: z.number().int().positive("fetchedAt must be a positive timestamp"),
  data: ScenarioDataSchema,
  metadata: z.object({
    title: z.string().min(1, "title is required"),
    author: z.string().min(1, "author is required"),
    size: z.number().int().nonnegative("size must be non-negative"),
    description: z.string().optional(),
  }),
});

/**
 * ScenarioCacheRecord の型（Zod から推論）
 */
export type ScenarioCacheRecordValidated = z.infer<typeof ScenarioCacheRecordSchema>;

/**
 * シナリオキャッシュデータをバリデーションします
 *
 * @param data バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validateScenarioCache(data: unknown) {
  return ScenarioCacheRecordSchema.safeParse(data);
}

/**
 * シナリオメタデータのみをバリデーションします
 *
 * データ本体を除外した軽量な検証を行います。
 *
 * @param data バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validateScenarioMetadata(data: unknown) {
  const MetadataOnlySchema = ScenarioCacheRecordSchema.pick({
    scenarioId: true,
    version: true,
    fetchedAt: true,
    metadata: true,
  });

  return MetadataOnlySchema.safeParse(data);
}
