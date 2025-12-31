import { z } from "zod";

/**
 * UserSettingsRecord の Zod バリデーションスキーマ
 *
 * ユーザー設定データのランタイム検証を行います。
 */
export const UserSettingsRecordSchema = z.object({
  key: z.string().min(1, "key is required"),
  value: z.unknown(), // JSON シリアライズ可能な任意の値
  updatedAt: z.number().int().positive("updatedAt must be a positive timestamp"),
});

/**
 * UserSettingsRecord の型（Zod から推論）
 */
export type UserSettingsRecordValidated = z.infer<typeof UserSettingsRecordSchema>;

/**
 * ユーザー設定の値をバリデーションします
 *
 * @param data バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validateUserSettings(data: unknown) {
  return UserSettingsRecordSchema.safeParse(data);
}
