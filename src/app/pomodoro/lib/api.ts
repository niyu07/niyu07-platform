// ポモドーロセッション用のAPI関数

export interface SaveSessionParams {
  userId: string;
  mode: string; // '作業' | '休憩' | '長休憩'
  category: string; // 'Coding' | 'Design' | etc.
  durationMinutes: number; // 分単位
  completionStatus?: string; // '完走' | '中断'
  startTime?: string; // ISO string
  endTime?: string; // ISO string
  taskId?: string;
}

export interface SessionResponse {
  id: string;
  userId: string;
  mode: string;
  category: string;
  durationMinutes: number;
  completionStatus: string;
  startTime: Date;
  endTime: Date | null;
  taskId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetSessionsParams {
  userId: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
}

export interface StatsResponse {
  totalSessions: number;
  focusSessions: number;
  breakSessions: number;
  totalFocusTime: number;
  totalBreakTime: number;
  sessions: {
    id: string;
    mode: string;
    category: string;
    durationMinutes: number;
    startTime: Date;
    endTime: Date | null;
    completionStatus: string;
  }[];
}

/**
 * セッションをDBに保存
 */
export async function saveSession(
  params: SaveSessionParams
): Promise<SessionResponse> {
  const response = await fetch('/api/pomodoro/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to save session: ${response.statusText}`);
  }

  return response.json();
}

/**
 * セッション履歴を取得
 */
export async function getSessions(
  params: GetSessionsParams
): Promise<SessionResponse[]> {
  const searchParams = new URLSearchParams({
    userId: params.userId,
  });

  if (params.startDate) {
    searchParams.append('startDate', params.startDate);
  }

  if (params.endDate) {
    searchParams.append('endDate', params.endDate);
  }

  const response = await fetch(
    `/api/pomodoro/sessions?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get sessions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 統計データを取得
 */
export async function getStats(
  userId: string,
  period: 'today' | 'week' | 'month' = 'today'
): Promise<StatsResponse> {
  const searchParams = new URLSearchParams({
    userId,
    period,
  });

  const response = await fetch(
    `/api/pomodoro/stats?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get stats: ${response.statusText}`);
  }

  return response.json();
}
