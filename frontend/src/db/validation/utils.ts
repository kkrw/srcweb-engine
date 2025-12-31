import { z } from "zod";

/**
 * バリデーション結果の型
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

/**
 * バリデーションエラーの型
 */
export interface ValidationError {
  path: (string | number)[];
  message: string;
  code: string;
}

/**
 * Zod のバリデーション結果を共通フォーマットに変換します
 *
 * @param result Zod の SafeParseReturnType
 * @returns 共通フォーマットのバリデーション結果
 */
export function formatValidationResult<T>(
  result: z.SafeParseReturnType<unknown, T>
): ValidationResult<T> {
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ValidationError[] = result.error.errors.map((error) => ({
    path: error.path,
    message: error.message,
    code: error.code,
  }));

  return { success: false, errors };
}

/**
 * バリデーションエラーを人間が読みやすい形式にフォーマットします
 *
 * @param errors バリデーションエラーの配列
 * @returns フォーマットされたエラーメッセージ
 */
export function formatErrorMessages(errors: ValidationError[]): string {
  return errors
    .map((error) => {
      const path = error.path.length > 0 ? `${error.path.join(".")}: ` : "";
      return `${path}${error.message}`;
    })
    .join("\n");
}

/**
 * データをバリデーションし、失敗時に例外をスローします
 *
 * @param schema Zod スキーマ
 * @param data バリデーション対象のデータ
 * @param errorPrefix エラーメッセージの接頭辞
 * @returns バリデーション済みのデータ
 * @throws バリデーションエラー
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorPrefix = "Validation failed"
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((error) => ({
      path: error.path,
      message: error.message,
      code: error.code,
    }));

    const errorMessage = `${errorPrefix}:\n${formatErrorMessages(errors)}`;
    throw new Error(errorMessage);
  }

  return result.data;
}

/**
 * データを部分的にバリデーションします（一部のフィールドのみ検証）
 *
 * @param schema Zod スキーマ
 * @param data バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validatePartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): ValidationResult<Partial<z.infer<z.ZodObject<T>>>> {
  const partialSchema = schema.partial();
  const result = partialSchema.safeParse(data);

  return formatValidationResult(result);
}

/**
 * 配列データを一括バリデーションします
 *
 * @param schema 配列の要素のスキーマ
 * @param data バリデーション対象の配列
 * @returns バリデーション結果の配列
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown[]
): Array<ValidationResult<T>> {
  return data.map((item) => {
    const result = schema.safeParse(item);
    return formatValidationResult(result);
  });
}

/**
 * バリデーション結果から成功したデータのみを抽出します
 *
 * @param results バリデーション結果の配列
 * @returns 成功したデータの配列
 */
export function extractSuccessfulData<T>(
  results: Array<ValidationResult<T>>
): T[] {
  return results
    .filter((result): result is { success: true; data: T } => result.success)
    .map((result) => result.data);
}

/**
 * バリデーション結果から失敗したエラーのみを抽出します
 *
 * @param results バリデーション結果の配列
 * @returns 失敗したエラーの配列
 */
export function extractValidationErrors<T>(
  results: Array<ValidationResult<T>>
): ValidationError[][] {
  return results
    .filter((result): result is { success: false; errors: ValidationError[] } => !result.success)
    .map((result) => result.errors);
}

/**
 * IndexedDB から取得したデータを安全にバリデーションします
 *
 * データが undefined または null の場合は失敗として扱います。
 *
 * @param schema Zod スキーマ
 * @param data バリデーション対象のデータ
 * @param recordName レコード名（エラーメッセージ用）
 * @returns バリデーション結果
 */
export function validateDBRecord<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  recordName: string
): ValidationResult<T> {
  if (data === undefined || data === null) {
    return {
      success: false,
      errors: [
        {
          path: [],
          message: `${recordName} not found`,
          code: "not_found",
        },
      ],
    };
  }

  const result = schema.safeParse(data);
  return formatValidationResult(result);
}
