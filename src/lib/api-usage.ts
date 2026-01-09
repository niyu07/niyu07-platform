/**
 * API使用量管理ユーティリティ
 * Google Cloud Vision API等の無料枠を超えないように使用量を追跡・制限します
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
 * API使用量の初期化上限値を取得
 * @param apiType APIの種類
 * @returns 月間上限値（デフォルト: 900）
 */
function getDefaultLimit(apiType: ApiType): number {
  const limits: Record<ApiType, number> = {
    vision: 900, // Google Cloud Vision API: 無料枠1,000の90%
    calendar: 900, // Google Calendar API: 適切な値を設定
    tasks: 900, // Google Tasks API: 適切な値を設定
    gmail: 900, // Gmail API: 適切な値を設定
  };
  return limits[apiType] || 900;
}

/**
 * 現在の使用量を取得
 * @param userId ユーザーID
 * @param apiType APIの種類
 * @returns 使用量情報
 */
export async function getUsage(
  userId: string,
  apiType: ApiType
): Promise<UsageInfo> {
  const month = getCurrentMonth();

  // 使用量レコードを取得または作成
  let usageLog = await prisma.apiUsageLog.findUnique({
    where: {
      userId_apiType_month: {
        userId,
        apiType,
        month,
      },
    },
  });

  // レコードが存在しない場合は新規作成
  if (!usageLog) {
    usageLog = await prisma.apiUsageLog.create({
      data: {
        userId,
        apiType,
        month,
        count: 0,
        limit: getDefaultLimit(apiType),
      },
    });
  }

  const remaining = Math.max(0, usageLog.limit - usageLog.count);
  const isOverLimit = usageLog.count >= usageLog.limit;
  const percentage = Math.min(
    100,
    Math.round((usageLog.count / usageLog.limit) * 100)
  );

  return {
    count: usageLog.count,
    limit: usageLog.limit,
    remaining,
    isOverLimit,
    percentage,
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

  // 現在の使用量を確認
  const usage = await getUsage(userId, apiType);

  // 上限チェック
  if (usage.isOverLimit) {
    throw new Error(
      `API使用量が月間上限（${usage.limit}回）に達しました。来月まで利用できません。`
    );
  }

  // 使用量を増加
  await prisma.apiUsageLog.update({
    where: {
      userId_apiType_month: {
        userId,
        apiType,
        month,
      },
    },
    data: {
      count: {
        increment: 1,
      },
    },
  });
}

/**
 * API使用量をチェック（増加なし）
 * @param userId ユーザーID
 * @param apiType APIの種類
 * @returns 使用可能かどうか
 */
export async function checkUsageLimit(
  userId: string,
  apiType: ApiType
): Promise<boolean> {
  const usage = await getUsage(userId, apiType);
  return !usage.isOverLimit;
}

/**
 * すべてのAPI種類の使用量を取得
 * @param userId ユーザーID
 * @returns すべてのAPI使用量情報
 */
export async function getAllUsage(
  userId: string
): Promise<Record<ApiType, UsageInfo>> {
  const apiTypes: ApiType[] = ['vision', 'calendar', 'tasks', 'gmail'];
  const usagePromises = apiTypes.map(async (apiType) => {
    const usage = await getUsage(userId, apiType);
    return [apiType, usage] as [ApiType, UsageInfo];
  });

  const usageArray = await Promise.all(usagePromises);
  return Object.fromEntries(usageArray) as Record<ApiType, UsageInfo>;
}

/**
 * 使用量上限を更新
 * @param userId ユーザーID
 * @param apiType APIの種類
 * @param newLimit 新しい上限値
 */
export async function updateUsageLimit(
  userId: string,
  apiType: ApiType,
  newLimit: number
): Promise<void> {
  const month = getCurrentMonth();

  await prisma.apiUsageLog.upsert({
    where: {
      userId_apiType_month: {
        userId,
        apiType,
        month,
      },
    },
    update: {
      limit: newLimit,
    },
    create: {
      userId,
      apiType,
      month,
      count: 0,
      limit: newLimit,
    },
  });
}

/**
 * 使用量をリセット（主にテスト用）
 * @param userId ユーザーID
 * @param apiType APIの種類
 */
export async function resetUsage(
  userId: string,
  apiType: ApiType
): Promise<void> {
  const month = getCurrentMonth();

  await prisma.apiUsageLog.update({
    where: {
      userId_apiType_month: {
        userId,
        apiType,
        month,
      },
    },
    data: {
      count: 0,
    },
  });
}
