import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getTaskLists,
  getTasks,
  createTask,
  completeTask,
  updateTaskWithPomodoroInfo,
  deleteTask,
} from '@/lib/google-tasks';

/**
 * GET - タスクまたはタスクリストを取得
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'lists' or 'tasks'
    const taskListId = searchParams.get('taskListId') || '@default';

    if (action === 'lists') {
      // タスクリストを取得
      const taskLists = await getTaskLists(session.user.id);
      return NextResponse.json(taskLists);
    } else {
      // タスクを取得
      const tasks = await getTasks(session.user.id, taskListId);
      return NextResponse.json(tasks);
    }
  } catch (error) {
    console.error('Google Tasks GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Google Tasks' },
      { status: 500 }
    );
  }
}

/**
 * POST - 新しいタスクを作成
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, notes, due, taskListId = '@default' } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await createTask(
      session.user.id,
      { title, notes, due },
      taskListId
    );

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Google Tasks POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create task in Google Tasks' },
      { status: 500 }
    );
  }
}

/**
 * PUT - タスクを更新（完了またはポモドーロ情報追加）
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, action, taskListId = '@default', pomodoroInfo } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'complete') {
      // タスクを完了
      result = await completeTask(session.user.id, taskId, taskListId);
    } else if (action === 'updatePomodoro' && pomodoroInfo) {
      // ポモドーロ情報を追加
      result = await updateTaskWithPomodoroInfo(
        session.user.id,
        taskId,
        pomodoroInfo,
        taskListId
      );
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Google Tasks PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update task in Google Tasks' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - タスクを削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const taskListId = searchParams.get('taskListId') || '@default';

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    await deleteTask(session.user.id, taskId, taskListId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Tasks DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task from Google Tasks' },
      { status: 500 }
    );
  }
}
