import { z } from "zod";

/**
 * DownloadProgressRecord の Zod バリデーションスキーマ
 *
 * ダウンロード進捗データのランタイム検証を行います。
 */
export const DownloadProgressRecordSchema = z.object({
  scenarioId: z.string().min(1, "scenarioId is required"),
  url: z.string().url("url must be a valid URL"),
  type: z.enum(["scenario", "image", "audio", "data"], {
    errorMap: () => ({
      message: "type must be 'scenario', 'image', 'audio', or 'data'",
    }),
  }),
  status: z.enum(["pending", "downloading", "completed", "error"], {
    errorMap: () => ({
      message: "status must be 'pending', 'downloading', 'completed', or 'error'",
    }),
  }),
  downloadedBytes: z.number().int().nonnegative("downloadedBytes must be non-negative"),
  totalBytes: z.number().int().nonnegative("totalBytes must be non-negative"),
  progress: z
    .number()
    .min(0, "progress must be between 0 and 100")
    .max(100, "progress must be between 0 and 100"),
  startedAt: z
    .number()
    .int()
    .positive("startedAt must be a positive timestamp")
    .optional(),
  completedAt: z
    .number()
    .int()
    .positive("completedAt must be a positive timestamp")
    .optional(),
  error: z.string().optional(),
  updatedAt: z.number().int().positive("updatedAt must be a positive timestamp"),
});

/**
 * DownloadProgressRecord の型（Zod から推論）
 */
export type DownloadProgressRecordValidated = z.infer<
  typeof DownloadProgressRecordSchema
>;

/**
 * ダウンロード進捗データをバリデーションします
 *
 * @param data バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validateDownloadProgress(data: unknown) {
  return DownloadProgressRecordSchema.safeParse(data);
}
