/**
 * API使用量管理ユーティリティ
 * Google Cloud Vision API等の無料枠を超えないように使用量を追跡・制限します
 *
 * すべてのGoogle API呼び出しを合算して月間上限（900回）で管理します。
 * - Vision API (OCR)
 * - Calendar API
 * - Tasks API
 * - Gmail API
 */

import { prisma } from '@/lib/prisma';

export type ApiType = 'vision' | 'calendar' | 'tasks' | 'gmail';

export interface UsageInfo {
  count: number;
  limit: number;
  remaining: number;
  isOverLimit: boolean;
  percentage: number;
}

export interface DetailedUsageInfo extends UsageInfo {
  breakdown: Record<ApiType, number>;
}

/**
 * 現在の年月を 'YYYY-MM' 形式で取得
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * すべてのGoogle APIの統合上限値
 * 無料枠1,000回の90%を安全マージンとして設定
 */
const TOTAL_API_LIMIT = 900;

/**
 * 統合されたAPI使用量を取得（全APIタイプの合計）
 * @param userId ユーザーID
 * @returns 統合使用量情報
 */
export async function getUsage(userId: string): Promise<UsageInfo> {
  const month = getCurrentMonth();

  // すべてのAPIタイプの使用量レコードを取得
  const usageLogs = await prisma.apiUsageLog.findMany({
    where: {
      userId,
      month,
    },
  });

  // 合計使用量を計算
  const totalCount = usageLogs.reduce((sum, log) => sum + log.count, 0);
  const remaining = Math.max(0, TOTAL_API_LIMIT - totalCount);
  const isOverLimit = totalCount >= TOTAL_API_LIMIT;
  const percentage = Math.min(
    100,
    Math.round((totalCount / TOTAL_API_LIMIT) * 100)
  );

  return {
    count: totalCount,
    limit: TOTAL_API_LIMIT,
    remaining,
    isOverLimit,
    percentage,
  };
}

/**
 * 詳細な使用量情報を取得（APIタイプ別の内訳付き）
 * @param userId ユーザーID
 * @returns 詳細使用量情報
 */
export async function getDetailedUsage(
  userId: string
): Promise<DetailedUsageInfo> {
  const month = getCurrentMonth();

  // すべてのAPIタイプの使用量レコードを取得
  const usageLogs = await prisma.apiUsageLog.findMany({
    where: {
      userId,
      month,
    },
  });

  // APIタイプ別の内訳を作成
  const breakdown: Record<ApiType, number> = {
    vision: 0,
    calendar: 0,
    tasks: 0,
    gmail: 0,
  };

  let totalCount = 0;
  for (const log of usageLogs) {
    if (log.apiType in breakdown) {
      breakdown[log.apiType as ApiType] = log.count;
      totalCount += log.count;
    }
  }

  const remaining = Math.max(0, TOTAL_API_LIMIT - totalCount);
  const isOverLimit = totalCount >= TOTAL_API_LIMIT;
  const percentage = Math.min(
    100,
    Math.round((totalCount / TOTAL_API_LIMIT) * 100)
  );

  return {
    count: totalCount,
    limit: TOTAL_API_LIMIT,
    remaining,
    isOverLimit,
    percentage,
    breakdown,
  };
}

/**
 * API使用量を増加させる（使用前にチェックも実施）
 * @param userId ユーザーID
 * @param apiType APIの種類
 * @throws Error 使用量が上限を超えている場合
 */
export async function incrementUsage(
  userId: string,
  apiType: ApiType
): Promise<void> {
  const month = getCurrentMonth();

  // 統合使用量を確認
  const usage = await getUsage(userId);

  // 上限チェック
  if (usage.isOverLimit) {
    throw new Error(
      `Google API使用量が月間上限（${usage.limit}回）に達しました。来月まで利用できません。`
    );
  }

  // 該当APIタイプの使用量レコードを取得または作成してインクリメント
  await prisma.apiUsageLog.upsert({
    where: {
      userId_apiType_month: {
        userId,
        apiType,
        month,
      },
    },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      userId,
      apiType,
      month,
      count: 1,
      limit: TOTAL_API_LIMIT, // 統合上限を記録（参考値）
    },
  });
}

/**
 * API使用量をチェック（増加なし）
 * @param userId ユーザーID
 * @returns 使用可能かどうか
 */
export async function checkUsageLimit(userId: string): Promise<boolean> {
  const usage = await getUsage(userId);
  return !usage.isOverLimit;
}

/**
 * 使用量をリセット（主にテスト用）
 * @param userId ユーザーID
 * @param apiType 特定のAPIタイプ（省略時は全てリセット）
 */
export async function resetUsage(
  userId: string,
  apiType?: ApiType
): Promise<void> {
  const month = getCurrentMonth();

  if (apiType) {
    // 特定のAPIタイプのみリセット
    await prisma.apiUsageLog.updateMany({
      where: {
        userId,
        apiType,
        month,
      },
      data: {
        count: 0,
      },
    });
  } else {
    // すべてのAPIタイプをリセット
    await prisma.apiUsageLog.updateMany({
      where: {
        userId,
        month,
      },
      data: {
        count: 0,
      },
    });
  }
}
