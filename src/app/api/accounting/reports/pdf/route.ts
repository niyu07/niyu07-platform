import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// jsPDFの型拡張
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

// 日本語フォントの設定（Noto Sans JPを想定）
// 注: jsPDFはデフォルトで日本語をサポートしていないため、カスタムフォントを埋め込む必要があります
// ここでは簡易的にASCII文字のみを使用するか、または外部フォントを埋め込む処理を追加する必要があります

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'userId, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    // userIdがemailの場合、User IDに変換
    const user = await prisma.user.findUnique({
      where: { email: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const actualUserId = user.id;

    // 日付範囲を設定
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // レポートデータを取得
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: actualUserId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // データを集計
    let totalRevenue = 0;
    let totalExpense = 0;
    const categoryBreakdown: Record<
      string,
      { revenue: number; expense: number; count: number }
    > = {};
    const revenueByClient: Record<
      string,
      { amount: number; transactions: number }
    > = {};

    transactions.forEach((transaction) => {
      if (transaction.type === '収入') {
        totalRevenue += transaction.amount;
        const clientName = transaction.client?.name || 'その他';
        if (!revenueByClient[clientName]) {
          revenueByClient[clientName] = { amount: 0, transactions: 0 };
        }
        revenueByClient[clientName].amount += transaction.amount;
        revenueByClient[clientName].transactions += 1;
      } else if (transaction.type === '経費') {
        totalExpense += transaction.amount;
      }

      if (!categoryBreakdown[transaction.category]) {
        categoryBreakdown[transaction.category] = {
          revenue: 0,
          expense: 0,
          count: 0,
        };
      }

      if (transaction.type === '収入') {
        categoryBreakdown[transaction.category].revenue += transaction.amount;
      } else if (transaction.type === '経費') {
        categoryBreakdown[transaction.category].expense += transaction.amount;
      }
      categoryBreakdown[transaction.category].count += 1;
    });

    const profit = totalRevenue - totalExpense;
    const profitMargin =
      totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

    // 取引先別売上をソート
    const topClients = Object.entries(revenueByClient)
      .map(([client, data]) => ({
        client,
        amount: data.amount,
        transactions: data.transactions,
        contribution:
          totalRevenue > 0 ? Math.round((data.amount / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // カテゴリ別経費をソート
    const expenseCategories = Object.entries(categoryBreakdown)
      .filter(([, data]) => data.expense > 0)
      .map(([category, data]) => ({
        category,
        amount: data.expense,
        percentage:
          totalExpense > 0
            ? Math.round((data.expense / totalExpense) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // PDF生成
    const doc = new jsPDF() as jsPDFWithAutoTable;

    // タイトル
    doc.setFontSize(20);
    doc.text('Accounting Report', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Period: ${startDate} - ${endDate}`, 105, 25, { align: 'center' });
    doc.text(`User: ${user.name || userId}`, 105, 32, { align: 'center' });

    // P/L サマリー
    doc.setFontSize(16);
    doc.text('Profit & Loss Summary', 14, 45);

    doc.setFontSize(12);
    autoTable(doc, {
      startY: 50,
      head: [['Item', 'Amount (JPY)', 'Percentage']],
      body: [
        ['Total Revenue', `¥${totalRevenue.toLocaleString()}`, '100%'],
        [
          'Total Expense',
          `¥${totalExpense.toLocaleString()}`,
          totalRevenue > 0
            ? `${Math.round((totalExpense / totalRevenue) * 100)}%`
            : '0%',
        ],
        ['Net Profit', `¥${profit.toLocaleString()}`, `${profitMargin}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
    });

    // 取引先別売上 TOP 10
    const clientTableY = (doc.lastAutoTable?.finalY ?? 50) + 15;
    doc.setFontSize(16);
    doc.text('Top 10 Clients by Revenue', 14, clientTableY);

    if (topClients.length > 0) {
      autoTable(doc, {
        startY: clientTableY + 5,
        head: [
          ['Rank', 'Client', 'Amount (JPY)', 'Transactions', 'Contribution'],
        ],
        body: topClients.map((client, index) => [
          `${index + 1}`,
          client.client,
          `¥${client.amount.toLocaleString()}`,
          `${client.transactions}`,
          `${client.contribution}%`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
      });
    } else {
      doc.setFontSize(10);
      doc.text(
        'No client data available for this period.',
        14,
        clientTableY + 10
      );
    }

    // 経費カテゴリ別内訳
    const categoryTableY = doc.lastAutoTable?.finalY
      ? doc.lastAutoTable.finalY + 15
      : clientTableY + 30;
    doc.setFontSize(16);
    doc.text('Expense Breakdown by Category', 14, categoryTableY);

    if (expenseCategories.length > 0) {
      autoTable(doc, {
        startY: categoryTableY + 5,
        head: [['Category', 'Amount (JPY)', 'Percentage']],
        body: expenseCategories.map((cat) => [
          cat.category,
          `¥${cat.amount.toLocaleString()}`,
          `${cat.percentage}%`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
      });
    } else {
      doc.setFontSize(10);
      doc.text(
        'No expense data available for this period.',
        14,
        categoryTableY + 10
      );
    }

    // 取引明細（最新20件）
    const transactionTableY = doc.lastAutoTable?.finalY
      ? doc.lastAutoTable.finalY + 15
      : categoryTableY + 30;

    // ページ追加が必要かチェック
    if (transactionTableY > 250) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Recent Transactions (Latest 20)', 14, 15);

      autoTable(doc, {
        startY: 20,
        head: [['Date', 'Type', 'Category', 'Detail', 'Amount (JPY)']],
        body: transactions
          .slice(0, 20)
          .map((t) => [
            new Date(t.date).toISOString().split('T')[0],
            t.type,
            t.category,
            t.detail,
            `¥${t.amount.toLocaleString()}`,
          ]),
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
      });
    } else {
      doc.setFontSize(16);
      doc.text('Recent Transactions (Latest 20)', 14, transactionTableY);

      autoTable(doc, {
        startY: transactionTableY + 5,
        head: [['Date', 'Type', 'Category', 'Detail', 'Amount (JPY)']],
        body: transactions
          .slice(0, 20)
          .map((t) => [
            new Date(t.date).toISOString().split('T')[0],
            t.type,
            t.category,
            t.detail,
            `¥${t.amount.toLocaleString()}`,
          ]),
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    // PDFをバイナリデータとして出力
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="accounting_report_${startDate}_${endDate}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/accounting/reports/pdf] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
