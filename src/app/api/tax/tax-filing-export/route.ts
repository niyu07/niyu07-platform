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

// 出力形式
type ExportFormat = 'pdf' | 'csv';

// 出力可能な項目
interface ExportOptions {
  includeSummary: boolean;
  includeDetailedTransactions: boolean;
  includeExpenseBreakdown: boolean;
  includeClientBreakdown: boolean;
  includeMonthlyBreakdown: boolean;
}

/**
 * GET /api/tax/tax-filing-export
 * 確定申告用のデータをエクスポート
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year');
    const format = (searchParams.get('format') || 'pdf') as ExportFormat;

    // オプション項目の取得
    const options: ExportOptions = {
      includeSummary: searchParams.get('includeSummary') !== 'false',
      includeDetailedTransactions:
        searchParams.get('includeDetailedTransactions') === 'true',
      includeExpenseBreakdown:
        searchParams.get('includeExpenseBreakdown') !== 'false',
      includeClientBreakdown:
        searchParams.get('includeClientBreakdown') !== 'false',
      includeMonthlyBreakdown:
        searchParams.get('includeMonthlyBreakdown') !== 'false',
    };

    if (!userId || !year) {
      return NextResponse.json(
        { error: 'userId and year are required' },
        { status: 400 }
      );
    }

    // 年度の開始日と終了日を計算
    const fiscalYear = parseInt(year);
    const startDate = new Date(fiscalYear, 0, 1); // 1月1日
    const endDate = new Date(fiscalYear, 11, 31, 23, 59, 59, 999); // 12月31日

    // userIdがemailの場合、User IDに変換
    const user = await prisma.user.findUnique({
      where: { email: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const actualUserId = user.id;

    // トランザクションデータを取得
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: actualUserId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // データを集計
    const summary = calculateSummary(transactions);
    const expenseBreakdown = calculateExpenseBreakdown(transactions);
    const clientBreakdown = calculateClientBreakdown(transactions);
    const monthlyBreakdown = calculateMonthlyBreakdown(
      transactions,
      fiscalYear
    );

    // フォーマットに応じて出力
    if (format === 'csv') {
      const csvContent = generateCSV(
        transactions,
        summary,
        expenseBreakdown,
        clientBreakdown,
        monthlyBreakdown,
        options
      );

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="tax_filing_${year}.csv"`,
        },
      });
    } else {
      // PDF
      const pdfBuffer = generatePDF(
        user,
        fiscalYear,
        transactions,
        summary,
        expenseBreakdown,
        clientBreakdown,
        monthlyBreakdown,
        options
      );

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="tax_filing_${year}.pdf"`,
        },
      });
    }
  } catch (error) {
    console.error('[GET /api/tax/tax-filing-export] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// トランザクション型定義
type Transaction = {
  id: string;
  type: string;
  amount: number;
  category: string;
  detail: string;
  date: Date;
  client?: { name: string } | null;
};

// サマリー計算
function calculateSummary(transactions: Transaction[]) {
  let totalRevenue = 0;
  let totalExpense = 0;
  const transactionCount = { revenue: 0, expense: 0 };

  transactions.forEach((transaction) => {
    if (transaction.type === '収入') {
      totalRevenue += transaction.amount;
      transactionCount.revenue += 1;
    } else if (transaction.type === '経費') {
      totalExpense += transaction.amount;
      transactionCount.expense += 1;
    }
  });

  const profit = totalRevenue - totalExpense;
  const profitMargin =
    totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

  return {
    totalRevenue,
    totalExpense,
    profit,
    profitMargin,
    transactionCount,
  };
}

// 経費カテゴリ別内訳
function calculateExpenseBreakdown(transactions: Transaction[]) {
  const breakdown: Record<
    string,
    { amount: number; count: number; percentage: number }
  > = {};
  let totalExpense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === '経費') {
      totalExpense += transaction.amount;
      if (!breakdown[transaction.category]) {
        breakdown[transaction.category] = {
          amount: 0,
          count: 0,
          percentage: 0,
        };
      }
      breakdown[transaction.category].amount += transaction.amount;
      breakdown[transaction.category].count += 1;
    }
  });

  // パーセンテージを計算
  Object.keys(breakdown).forEach((category) => {
    breakdown[category].percentage =
      totalExpense > 0
        ? Math.round((breakdown[category].amount / totalExpense) * 100)
        : 0;
  });

  return Object.entries(breakdown)
    .map(([category, data]) => ({
      category,
      ...data,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// 取引先別内訳
function calculateClientBreakdown(transactions: Transaction[]) {
  const breakdown: Record<
    string,
    { amount: number; count: number; contribution: number }
  > = {};
  let totalRevenue = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === '収入') {
      totalRevenue += transaction.amount;
      const clientName = transaction.client?.name || 'その他';
      if (!breakdown[clientName]) {
        breakdown[clientName] = { amount: 0, count: 0, contribution: 0 };
      }
      breakdown[clientName].amount += transaction.amount;
      breakdown[clientName].count += 1;
    }
  });

  // 貢献率を計算
  Object.keys(breakdown).forEach((client) => {
    breakdown[client].contribution =
      totalRevenue > 0
        ? Math.round((breakdown[client].amount / totalRevenue) * 100)
        : 0;
  });

  return Object.entries(breakdown)
    .map(([client, data]) => ({
      client,
      ...data,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// 月次内訳
function calculateMonthlyBreakdown(transactions: Transaction[], year: number) {
  const monthlyData: Record<
    number,
    { revenue: number; expense: number; profit: number }
  > = {};

  // 初期化
  for (let month = 1; month <= 12; month++) {
    monthlyData[month] = { revenue: 0, expense: 0, profit: 0 };
  }

  transactions.forEach((transaction) => {
    const month = new Date(transaction.date).getMonth() + 1;
    if (transaction.type === '収入') {
      monthlyData[month].revenue += transaction.amount;
    } else if (transaction.type === '経費') {
      monthlyData[month].expense += transaction.amount;
    }
  });

  // 利益を計算
  Object.keys(monthlyData).forEach((monthStr) => {
    const month = parseInt(monthStr);
    monthlyData[month].profit =
      monthlyData[month].revenue - monthlyData[month].expense;
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month: parseInt(month),
    monthLabel: `${year}年${month}月`,
    ...data,
  }));
}

// サマリー型定義
type Summary = {
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
  transactionCount: { revenue: number; expense: number };
};

type ExpenseBreakdownItem = {
  category: string;
  amount: number;
  count: number;
  percentage: number;
};

type ClientBreakdownItem = {
  client: string;
  amount: number;
  count: number;
  contribution: number;
};

type MonthlyBreakdownItem = {
  month: number;
  monthLabel: string;
  revenue: number;
  expense: number;
  profit: number;
};

// CSV生成
function generateCSV(
  transactions: Transaction[],
  summary: Summary,
  expenseBreakdown: ExpenseBreakdownItem[],
  clientBreakdown: ClientBreakdownItem[],
  monthlyBreakdown: MonthlyBreakdownItem[],
  options: ExportOptions
): string {
  const lines: string[] = [];
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility

  // サマリー
  if (options.includeSummary) {
    lines.push('# 確定申告サマリー');
    lines.push('項目,金額(円),備考');
    lines.push(
      `総売上,${summary.totalRevenue},取引件数: ${summary.transactionCount.revenue}件`
    );
    lines.push(
      `総経費,${summary.totalExpense},取引件数: ${summary.transactionCount.expense}件`
    );
    lines.push(`利益,${summary.profit},利益率: ${summary.profitMargin}%`);
    lines.push('');
  }

  // 経費カテゴリ別内訳
  if (options.includeExpenseBreakdown && expenseBreakdown.length > 0) {
    lines.push('# 経費カテゴリ別内訳');
    lines.push('カテゴリ,金額(円),件数,割合(%)');
    expenseBreakdown.forEach((item) => {
      lines.push(
        `${item.category},${item.amount},${item.count},${item.percentage}`
      );
    });
    lines.push('');
  }

  // 取引先別内訳
  if (options.includeClientBreakdown && clientBreakdown.length > 0) {
    lines.push('# 取引先別売上内訳');
    lines.push('取引先,金額(円),取引件数,貢献率(%)');
    clientBreakdown.forEach((item) => {
      lines.push(
        `${item.client},${item.amount},${item.count},${item.contribution}`
      );
    });
    lines.push('');
  }

  // 月次内訳
  if (options.includeMonthlyBreakdown && monthlyBreakdown.length > 0) {
    lines.push('# 月次収支内訳');
    lines.push('月,売上(円),経費(円),利益(円)');
    monthlyBreakdown.forEach((item) => {
      lines.push(
        `${item.monthLabel},${item.revenue},${item.expense},${item.profit}`
      );
    });
    lines.push('');
  }

  // 取引明細
  if (options.includeDetailedTransactions && transactions.length > 0) {
    lines.push('# 取引明細');
    lines.push('日付,種別,カテゴリ,取引先,詳細,金額(円)');
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      const client = transaction.client?.name || '';
      lines.push(
        `${date},${transaction.type},${transaction.category},${client},${transaction.detail},${transaction.amount}`
      );
    });
  }

  return BOM + lines.join('\n');
}

type User = {
  id: string;
  name: string | null;
  email: string;
};

// PDF生成
function generatePDF(
  user: User,
  year: number,
  transactions: Transaction[],
  summary: Summary,
  expenseBreakdown: ExpenseBreakdownItem[],
  clientBreakdown: ClientBreakdownItem[],
  monthlyBreakdown: MonthlyBreakdownItem[],
  options: ExportOptions
): ArrayBuffer {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // タイトル
  doc.setFontSize(20);
  doc.text(`Tax Filing Report - ${year}`, 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`User: ${user.name || user.email}`, 105, 25, { align: 'center' });
  doc.text(`Period: ${year}/01/01 - ${year}/12/31`, 105, 32, {
    align: 'center',
  });

  let currentY = 45;

  // サマリー
  if (options.includeSummary) {
    doc.setFontSize(16);
    doc.text('Summary', 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Item', 'Amount (JPY)', 'Details']],
      body: [
        [
          'Total Revenue',
          `¥${summary.totalRevenue.toLocaleString()}`,
          `Transactions: ${summary.transactionCount.revenue}`,
        ],
        [
          'Total Expense',
          `¥${summary.totalExpense.toLocaleString()}`,
          `Transactions: ${summary.transactionCount.expense}`,
        ],
        [
          'Net Profit',
          `¥${summary.profit.toLocaleString()}`,
          `Profit Margin: ${summary.profitMargin}%`,
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
    });

    currentY = (doc.lastAutoTable?.finalY ?? currentY) + 15;
  }

  // 経費カテゴリ別内訳
  if (
    options.includeExpenseBreakdown &&
    expenseBreakdown.length > 0 &&
    currentY < 250
  ) {
    doc.setFontSize(16);
    doc.text('Expense Breakdown by Category', 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Category', 'Amount (JPY)', 'Count', 'Percentage']],
      body: expenseBreakdown.map((item) => [
        item.category,
        `¥${item.amount.toLocaleString()}`,
        `${item.count}`,
        `${item.percentage}%`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    currentY = (doc.lastAutoTable?.finalY ?? currentY) + 15;
  }

  // ページ追加が必要な場合
  if (currentY > 240) {
    doc.addPage();
    currentY = 15;
  }

  // 取引先別内訳
  if (options.includeClientBreakdown && clientBreakdown.length > 0) {
    doc.setFontSize(16);
    doc.text('Revenue Breakdown by Client', 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Client', 'Amount (JPY)', 'Transactions', 'Contribution']],
      body: clientBreakdown
        .slice(0, 20)
        .map((item) => [
          item.client,
          `¥${item.amount.toLocaleString()}`,
          `${item.count}`,
          `${item.contribution}%`,
        ]),
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    currentY = (doc.lastAutoTable?.finalY ?? currentY) + 15;
  }

  // ページ追加が必要な場合
  if (currentY > 240) {
    doc.addPage();
    currentY = 15;
  }

  // 月次内訳
  if (options.includeMonthlyBreakdown && monthlyBreakdown.length > 0) {
    doc.setFontSize(16);
    doc.text('Monthly Breakdown', 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Month', 'Revenue (JPY)', 'Expense (JPY)', 'Profit (JPY)']],
      body: monthlyBreakdown.map((item) => [
        item.monthLabel,
        `¥${item.revenue.toLocaleString()}`,
        `¥${item.expense.toLocaleString()}`,
        `¥${item.profit.toLocaleString()}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    currentY = (doc.lastAutoTable?.finalY ?? currentY) + 15;
  }

  // 取引明細
  if (options.includeDetailedTransactions && transactions.length > 0) {
    // 新しいページを追加
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Transaction Details', 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [['Date', 'Type', 'Category', 'Client', 'Detail', 'Amount (JPY)']],
      body: transactions.map((t) => [
        new Date(t.date).toISOString().split('T')[0],
        t.type,
        t.category,
        t.client?.name || '',
        t.detail,
        `¥${t.amount.toLocaleString()}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
    });
  }

  // PDFをバイナリデータとして出力
  return doc.output('arraybuffer');
}
