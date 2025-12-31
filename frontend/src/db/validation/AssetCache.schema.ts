import { z } from "zod";

/**
 * AssetCacheRecord の Zod バリデーションスキーマ
 *
 * アセットキャッシュデータのランタイム検証を行います。
 */
export const AssetCacheRecordSchema = z.object({
  scenarioId: z.string().min(1, "scenarioId is required"),
  url: z.string().url("url must be a valid URL"),
  type: z.enum(["image", "audio", "data"], {
    errorMap: () => ({ message: "type must be 'image', 'audio', or 'data'" }),
  }),
  blob: z.instanceof(Blob, { message: "blob must be a Blob instance" }),
  fetchedAt: z.number().int().positive("fetchedAt must be a positive timestamp"),
  size: z.number().int().nonnegative("size must be non-negative"),
  expiresAt: z
    .number()
    .int()
    .positive("expiresAt must be a positive timestamp")
    .optional(),
  mimeType: z.string().min(1, "mimeType is required"),
});

/**
 * AssetCacheRecord の型（Zod から推論）
 */
export type AssetCacheRecordValidated = z.infer<typeof AssetCacheRecordSchema>;

/**
 * アセットキャッシュデータをバリデーションします
 *
 * @param data バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validateAssetCache(data: unknown) {
  return AssetCacheRecordSchema.safeParse(data);
}
