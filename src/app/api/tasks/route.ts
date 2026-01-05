import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  getTaskLists,
  getTasks,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} from '@/lib/google-tasks';

// タスクリスト一覧またはタスクを取得
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('Unauthorized access - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskListId = searchParams.get('taskListId');
    const fetchAll = searchParams.get('all') === 'true';

    console.log('Tasks API GET:', {
      userId: session.user.id,
      fetchAll,
      taskListId,
    });

    if (fetchAll) {
      // すべてのタスクリストからタスクを取得
      const tasks = await getAllTasks(session.user.id);
      console.log(`✅ Fetched ${tasks.length} tasks from all lists`);
      return NextResponse.json({ tasks });
    } else if (taskListId) {
      // 特定のタスクリストのタスクを取得
      const tasks = await getTasks(session.user.id, taskListId);
      console.log(`✅ Fetched ${tasks.length} tasks from list ${taskListId}`);
      return NextResponse.json({ tasks });
    } else {
      // タスクリスト一覧を取得
      const taskLists = await getTaskLists(session.user.id);
      console.log(`✅ Fetched ${taskLists.length} task lists`);
      return NextResponse.json({ taskLists });
    }
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch tasks';
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// タスクを作成
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, notes, due, taskListId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await createTask(
      session.user.id,
      { title, notes, due },
      taskListId || '@default'
    );

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// タスクを更新
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, taskListId, title, notes, due, status } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const task = await updateTask(
      session.user.id,
      taskId,
      { title, notes, due, status },
      taskListId || '@default'
    );

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// タスクを削除
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const taskListId = searchParams.get('taskListId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    await deleteTask(session.user.id, taskId, taskListId || '@default');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

// タスクを完了
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, taskListId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const task = await completeTask(
      session.user.id,
      taskId,
      taskListId || '@default'
    );

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}
