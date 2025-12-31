import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 取引の取得（READ）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // '収入' | '経費'
    const category = searchParams.get('category');

    console.log('[GET /api/accounting/transactions] Request params:', {
      userId,
      startDate,
      endDate,
      type,
      category,
    });

    if (!userId) {
      console.error('[GET /api/accounting/transactions] Missing userId');
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // クエリ条件を構築
    const where: {
      userId: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
      type?: string;
      category?: string;
    } = { userId };

    // 日付範囲フィルター
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // 種別フィルター
    if (type) {
      where.type = type;
    }

    // カテゴリフィルター
    if (category) {
      where.category = category;
    }

    console.log(
      '[GET /api/accounting/transactions] Query where clause:',
      where
    );

    // 取引を取得
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        client: true, // 取引先情報も含める
      },
      orderBy: {
        date: 'desc', // 新しい順
      },
    });

    console.log(
      '[GET /api/accounting/transactions] Found transactions:',
      transactions.length
    );
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[GET /api/accounting/transactions] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 取引の作成（CREATE）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      date,
      type,
      category,
      detail,
      amount,
      clientName, // 取引先名（新規または既存）
      clientType, // '法人' | '個人'
      taxCategory,
      memo,
      attachments,
    } = body;

    console.log('[POST /api/accounting/transactions] Request body:', body);

    // 必須フィールドのバリデーション
    if (
      !userId ||
      !date ||
      !type ||
      !category ||
      !detail ||
      amount === undefined
    ) {
      return NextResponse.json(
        {
          error:
            'userId, date, type, category, detail, and amount are required',
        },
        { status: 400 }
      );
    }

    // 日付を正規化
    const transactionDate = new Date(date);
    transactionDate.setHours(0, 0, 0, 0);

    // 取引先の処理
    let clientId: string | null = null;
    if (clientName && clientName.trim() !== '') {
      // 既存の取引先を検索
      let client = await prisma.client.findFirst({
        where: {
          userId,
          name: clientName,
        },
      });

      // 取引先が存在しない場合は新規作成
      if (!client) {
        console.log(
          '[POST /api/accounting/transactions] Creating new client:',
          clientName
        );
        client = await prisma.client.create({
          data: {
            userId,
            name: clientName,
            type: clientType || '法人',
          },
        });
      }

      clientId = client.id;
    }

    // 取引を作成
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        date: transactionDate,
        type,
        category,
        detail,
        amount: parseInt(amount.toString(), 10), // 数値に変換
        clientId,
        taxCategory: taxCategory || '課税',
        memo: memo || null,
        attachments: attachments || [],
      },
      include: {
        client: true,
      },
    });

    console.log(
      '[POST /api/accounting/transactions] Transaction created:',
      transaction.id
    );

    // 月別集計データを更新
    await updateMonthlyFinancialData(userId, transactionDate);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(
      '[POST /api/accounting/transactions] Error creating transaction:',
      error
    );
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 取引の更新（UPDATE）- PUT
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const {
      userId,
      date,
      type,
      category,
      detail,
      amount,
      clientName,
      clientType,
      taxCategory,
      memo,
      attachments,
    } = body;

    console.log(
      '[PUT /api/accounting/transactions] Request body:',
      body,
      'id:',
      id
    );

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // 必須フィールドのバリデーション
    if (
      !userId ||
      !date ||
      !type ||
      !category ||
      !detail ||
      amount === undefined
    ) {
      return NextResponse.json(
        {
          error:
            'userId, date, type, category, detail, and amount are required',
        },
        { status: 400 }
      );
    }

    // 既存の取引を取得
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // 日付を正規化
    const transactionDate = new Date(date);
    transactionDate.setHours(0, 0, 0, 0);

    // 取引先の処理
    let clientId: string | null = null;
    if (clientName && clientName.trim() !== '') {
      // 既存の取引先を検索
      let client = await prisma.client.findFirst({
        where: {
          userId,
          name: clientName,
        },
      });

      // 取引先が存在しない場合は新規作成
      if (!client) {
        console.log(
          '[PUT /api/accounting/transactions] Creating new client:',
          clientName
        );
        client = await prisma.client.create({
          data: {
            userId,
            name: clientName,
            type: clientType || '法人',
          },
        });
      }

      clientId = client.id;
    }

    // 取引を更新
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        date: transactionDate,
        type,
        category,
        detail,
        amount: parseInt(amount.toString(), 10),
        clientId,
        taxCategory: taxCategory || '課税',
        memo: memo || null,
        attachments: attachments || [],
      },
      include: {
        client: true,
      },
    });

    console.log(
      '[PUT /api/accounting/transactions] Transaction updated:',
      transaction.id
    );

    // 月別集計データを更新
    await updateMonthlyFinancialData(userId, transactionDate);
    if (existingTransaction.date.getTime() !== transactionDate.getTime()) {
      // 日付が変更された場合は、元の月も再計算
      await updateMonthlyFinancialData(userId, existingTransaction.date);
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error(
      '[PUT /api/accounting/transactions] Error updating transaction:',
      error
    );
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 取引の更新（UPDATE）- PATCH（部分更新）
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      date,
      type,
      category,
      detail,
      amount,
      clientName,
      clientType,
      taxCategory,
      memo,
      attachments,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // 既存の取引を取得
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // 日付が変更された場合は正規化
    let transactionDate = existingTransaction.date;
    if (date) {
      transactionDate = new Date(date);
      transactionDate.setHours(0, 0, 0, 0);
    }

    // 取引先の処理
    let clientId: string | null | undefined = undefined; // undefinedは更新しない
    if (clientName !== undefined) {
      if (clientName === null || clientName.trim() === '') {
        clientId = null;
      } else {
        // 既存の取引先を検索
        let client = await prisma.client.findFirst({
          where: {
            userId: existingTransaction.userId,
            name: clientName,
          },
        });

        // 取引先が存在しない場合は新規作成
        if (!client) {
          client = await prisma.client.create({
            data: {
              userId: existingTransaction.userId,
              name: clientName,
              type: clientType || '法人',
            },
          });
        }

        clientId = client.id;
      }
    }

    // 取引を更新
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(date && { date: transactionDate }),
        ...(type && { type }),
        ...(category && { category }),
        ...(detail && { detail }),
        ...(amount !== undefined && {
          amount: parseInt(amount.toString(), 10),
        }),
        ...(clientId !== undefined && { clientId }),
        ...(taxCategory && { taxCategory }),
        ...(memo !== undefined && { memo }),
        ...(attachments !== undefined && { attachments }),
      },
      include: {
        client: true,
      },
    });

    // 月別集計データを更新
    await updateMonthlyFinancialData(
      existingTransaction.userId,
      transactionDate
    );
    if (date && date !== existingTransaction.date.toISOString().split('T')[0]) {
      // 日付が変更された場合は、元の月も再計算
      await updateMonthlyFinancialData(
        existingTransaction.userId,
        existingTransaction.date
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error(
      '[PATCH /api/accounting/transactions] Error updating transaction:',
      error
    );
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 取引の削除（DELETE）
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // 既存の取引を取得
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // 取引を削除
    await prisma.transaction.delete({
      where: { id },
    });

    // 月別集計データを更新
    await updateMonthlyFinancialData(
      existingTransaction.userId,
      existingTransaction.date
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      '[DELETE /api/accounting/transactions] Error deleting transaction:',
      error
    );
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ヘルパー関数: 月別収支データを更新
async function updateMonthlyFinancialData(userId: string, date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  // その月の取引を集計
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // 収入と経費を計算
  let revenue = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === '収入') {
      revenue += transaction.amount;
    } else if (transaction.type === '経費') {
      expense += transaction.amount;
    }
  });

  const profit = revenue - expense;

  // 月別データを作成または更新
  await prisma.monthlyFinancialData.upsert({
    where: {
      userId_year_month: {
        userId,
        year,
        month,
      },
    },
    update: {
      revenue,
      expense,
      profit,
    },
    create: {
      userId,
      year,
      month,
      revenue,
      expense,
      profit,
    },
  });

  console.log(
    `[updateMonthlyFinancialData] Updated ${year}/${month}: revenue=${revenue}, expense=${expense}, profit=${profit}`
  );
}
