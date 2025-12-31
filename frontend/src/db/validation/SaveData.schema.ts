import { z } from "zod";

/**
 * セーブデータメタデータの Zod バリデーションスキーマ
 */
const SaveDataMetadataSchema = z.object({
  scenarioName: z.string().min(1, "scenarioName is required"),
  playTime: z.number().int().nonnegative("playTime must be non-negative"),
  version: z.number().int().positive("version must be a positive integer"),
});

/**
 * SaveDataRecord の Zod バリデーションスキーマ
 *
 * セーブデータのランタイム検証を行います。
 */
export const SaveDataRecordSchema = z.object({
  slotId: z.string().min(1, "slotId is required"),
  scenarioId: z.string().min(1, "scenarioId is required"),
  timestamp: z.number().int().positive("timestamp must be a positive timestamp"),
  turn: z.number().int().nonnegative("turn must be non-negative"),
  deleted: z.boolean(),

  // TODO: GameState の詳細なバリデーションスキーマを追加
  // 現在は unknown で許容していますが、GameStateSchema を作成して適用することを推奨
  // GameState には EventState、MapData などの複雑な構造が含まれるため、
  // 段階的にスキーマを作成していくことを推奨します
  gameState: z.unknown(),

  // TODO: UnitData の詳細なバリデーションスキーマを追加
  // 現在は unknown で許容していますが、UnitDataSchema を作成して適用することを推奨
  units: z.array(z.unknown()),

  // TODO: PilotData の詳細なバリデーションスキーマを追加
  // 現在は unknown で許容していますが、PilotDataSchema を作成して適用することを推奨
  pilots: z.array(z.unknown()),

  thumbnail: z.string().optional(),
  metadata: SaveDataMetadataSchema,
});

/**
 * SaveDataRecord の型（Zod から推論）
 */
export type SaveDataRecordValidated = z.infer<typeof SaveDataRecordSchema>;

/**
 * セーブデータをバリデーションします
 *
 * @param data バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validateSaveData(data: unknown) {
  return SaveDataRecordSchema.safeParse(data);
}

/**
 * セーブデータのメタデータのみをバリデーションします
 *
 * データ本体を除外した軽量な検証を行います。
 * セーブデータの一覧表示など、詳細データが不要な場合に使用します。
 *
 * @param data バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validateSaveDataMetadata(data: unknown) {
  const MetadataOnlySchema = SaveDataRecordSchema.pick({
    slotId: true,
    scenarioId: true,
    timestamp: true,
    turn: true,
    deleted: true,
    metadata: true,
    thumbnail: true,
  });

  return MetadataOnlySchema.safeParse(data);
}
