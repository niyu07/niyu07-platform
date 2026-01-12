import { google } from 'googleapis';
import { prisma } from './prisma';

/**
 * ユーザーのGoogle Tasksクライアントを取得
 */
async function getTasksClient(userId: string) {
  // ユーザーのアクセストークンを取得
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'google',
    },
  });

  if (!account || !account.refresh_token) {
    throw new Error('Google認証情報が見つかりません');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // トークンの自動更新を設定
  oauth2Client.on('tokens', async (tokens) => {
    console.log('🔄 Refreshing Google tokens...');
    try {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token ?? account.access_token,
          refresh_token: tokens.refresh_token ?? account.refresh_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : account.expires_at,
        },
      });
    } catch (updateError) {
      console.error('❌ トークン更新の保存エラー:', updateError);
    }
  });

  // トークンが期限切れの場合は事前にリフレッシュ
  try {
    const tokenInfo = await oauth2Client.getAccessToken();
    if (tokenInfo.token && tokenInfo.token !== account.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokenInfo.token,
        },
      });
    }
  } catch (error: any) {
    console.error('❌ トークンリフレッシュエラー:', error);

    // invalid_grantエラーの場合は、アカウントのトークンを削除
    if (error?.message?.includes('invalid_grant') || error?.code === 400) {
      console.log('⚠️ リフレッシュトークンが無効です。アカウント情報をクリアします。');
      await prisma.account.delete({
        where: { id: account.id },
      });
      throw new Error(
        'Google認証トークンが無効になりました。再度ログインしてください。'
      );
    }

    throw new Error(
      'Google認証トークンの更新に失敗しました。再度ログインしてください。'
    );
  }

  return google.tasks({ version: 'v1', auth: oauth2Client });
}

/**
 * タスクリストを取得
 */
export async function getTaskLists(userId: string) {
  try {
    const tasks = await getTasksClient(userId);
    const response = await tasks.tasklists.list();
    return response.data.items || [];
  } catch (error) {
    console.error('❌ タスクリスト取得エラー:', error);
    throw error;
  }
}

/**
 * 特定のタスクリストのタスクを取得
 */
export async function getTasks(
  userId: string,
  taskListId: string = '@default'
) {
  try {
    const tasks = await getTasksClient(userId);
    const response = await tasks.tasks.list({
      tasklist: taskListId,
      showCompleted: false, // 未完了のタスクのみ
      showHidden: false,
    });
    return response.data.items || [];
  } catch (error) {
    console.error('❌ タスク取得エラー:', error);
    throw error;
  }
}

/**
 * 新しいタスクを作成
 */
export async function createTask(
  userId: string,
  taskData: {
    title: string;
    notes?: string;
    due?: string; // ISO 8601形式
  },
  taskListId: string = '@default'
) {
  try {
    const tasks = await getTasksClient(userId);
    const response = await tasks.tasks.insert({
      tasklist: taskListId,
      requestBody: {
        title: taskData.title,
        notes: taskData.notes,
        due: taskData.due,
      },
    });
    console.log('✅ Google Tasksにタスクを作成しました:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ タスク作成エラー:', error);
    throw error;
  }
}

/**
 * タスクを完了としてマーク
 */
export async function completeTask(
  userId: string,
  taskId: string,
  taskListId: string = '@default'
) {
  try {
    const tasks = await getTasksClient(userId);
    const response = await tasks.tasks.update({
      tasklist: taskListId,
      task: taskId,
      requestBody: {
        status: 'completed',
        completed: new Date().toISOString(),
      },
    });
    console.log('✅ Google Tasksのタスクを完了しました:', taskId);
    return response.data;
  } catch (error) {
    console.error('❌ タスク完了エラー:', error);
    throw error;
  }
}

/**
 * タスクを更新（ポモドーロセッション情報を追加）
 */
export async function updateTaskWithPomodoroInfo(
  userId: string,
  taskId: string,
  pomodoroInfo: {
    sessionCount: number;
    totalMinutes: number;
  },
  taskListId: string = '@default'
) {
  try {
    const tasks = await getTasksClient(userId);

    // 既存のタスク情報を取得
    const existingTask = await tasks.tasks.get({
      tasklist: taskListId,
      task: taskId,
    });

    const existingNotes = existingTask.data.notes || '';
    const pomodoroNote = `\n\n🍅 ポモドーロ: ${pomodoroInfo.sessionCount}セッション (${pomodoroInfo.totalMinutes}分)`;

    const response = await tasks.tasks.update({
      tasklist: taskListId,
      task: taskId,
      requestBody: {
        notes: existingNotes + pomodoroNote,
      },
    });

    console.log('✅ タスクにポモドーロ情報を追加しました:', taskId);
    return response.data;
  } catch (error) {
    console.error('❌ タスク更新エラー:', error);
    throw error;
  }
}

/**
 * タスクを削除
 */
export async function deleteTask(
  userId: string,
  taskId: string,
  taskListId: string = '@default'
) {
  try {
    const tasks = await getTasksClient(userId);
    await tasks.tasks.delete({
      tasklist: taskListId,
      task: taskId,
    });
    console.log('✅ Google Tasksからタスクを削除しました:', taskId);
  } catch (error) {
    console.error('❌ タスク削除エラー:', error);
    throw error;
  }
}

/**
 * タスクを更新
 */
export async function updateTask(
  userId: string,
  taskId: string,
  taskData: {
    title?: string;
    notes?: string;
    due?: string;
    status?: 'needsAction' | 'completed';
  },
  taskListId: string = '@default'
) {
  try {
    const tasks = await getTasksClient(userId);
    const response = await tasks.tasks.patch({
      tasklist: taskListId,
      task: taskId,
      requestBody: taskData,
    });
    console.log('✅ タスクを更新しました:', taskId);
    return response.data;
  } catch (error) {
    console.error('❌ タスク更新エラー:', error);
    throw error;
  }
}

/**
 * すべてのタスクリストからタスクを取得
 */
export async function getAllTasks(userId: string) {
  try {
    const taskLists = await getTaskLists(userId);
    const tasksClient = await getTasksClient(userId);

    const promises = taskLists.map(async (taskList) => {
      if (!taskList.id) return [];
      const response = await tasksClient.tasks.list({
        tasklist: taskList.id,
        showCompleted: true,
        showHidden: false,
        maxResults: 100,
      });
      return (response.data.items || []).map((task) => ({
        ...task,
        taskListId: taskList.id,
        taskListTitle: taskList.title,
      }));
    });

    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error('❌ 全タスク取得エラー:', error);
    throw error;
  }
}
