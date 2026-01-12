import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  id: string;
  date: Date | string;
  type: string;
  category: string;
  detail: string;
  amount: number;
  taxCategory: string;
  memo?: string | null;
  client?: {
    name: string;
  } | null;
}

interface Receipt {
  id: string;
  imageUrl: string;
  uploadedAt: Date | string;
  ocrData?: {
    storeName?: string | null;
    transactionDate?: Date | string | null;
    totalAmount?: number | null;
    taxAmount?: number | null;
    paymentMethod?: string | null;
  } | null;
}

interface MonthlyData {
  month: number;
  revenue: number;
  expense: number;
  profit: number;
  transactionCount: number;
}

interface CategoryData {
  [category: string]: {
    revenue: number;
    expense: number;
    count: number;
  };
}

interface ExportData {
  year: number;
  summary: {
    totalRevenue: number;
    totalExpense: number;
    totalProfit: number;
    transactionCount: number;
    receiptCount: number;
  };
  transactions: Transaction[];
  receipts: Receipt[];
  monthlyData: MonthlyData[];
  categoryData: CategoryData;
}

/**
 * 日付をフォーマット (YYYY-MM-DD)
 */
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * CSVエクスポート（取引データ）
 */
export const exportTransactionsToCSV = (
  transactions: Transaction[],
  year: number
): void => {
  const headers = [
    '日付',
    '種別',
    'カテゴリ',
    '詳細',
    '金額（円）',
    '取引先',
    '税区分',
    'メモ',
  ];

  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.type,
    t.category,
    t.detail,
    t.amount,
    t.client?.name || '',
    t.taxCategory,
    t.memo || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  saveAs(blob, `取引データ_${year}年.csv`);
};

/**
 * CSVエクスポート（領収書データ）
 */
export const exportReceiptsToCSV = (
  receipts: Receipt[],
  year: number
): void => {
  const headers = [
    'アップロード日',
    '取引日',
    '店舗名',
    '合計金額（円）',
    '消費税（円）',
    '支払方法',
  ];

  const rows = receipts.map((r) => [
    formatDate(r.uploadedAt),
    r.ocrData?.transactionDate
      ? formatDate(r.ocrData.transactionDate)
      : '未検出',
    r.ocrData?.storeName || '未検出',
    r.ocrData?.totalAmount || 0,
    r.ocrData?.taxAmount || 0,
    r.ocrData?.paymentMethod || '未検出',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  saveAs(blob, `領収書データ_${year}年.csv`);
};

/**
 * Excelエクスポート（複数シート: 取引、領収書、月別集計、カテゴリ別集計）
 */
export const exportToExcel = (data: ExportData): void => {
  const workbook = XLSX.utils.book_new();

  // シート1: 年間サマリ
  const summaryData = [
    ['項目', '金額（円）'],
    ['総収入', data.summary.totalRevenue],
    ['総経費', data.summary.totalExpense],
    ['総利益', data.summary.totalProfit],
    ['取引件数', data.summary.transactionCount],
    ['領収書件数', data.summary.receiptCount],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'サマリ');

  // シート2: 取引データ
  const transactionData = [
    ['日付', '種別', 'カテゴリ', '詳細', '金額', '取引先', '税区分', 'メモ'],
    ...data.transactions.map((t) => [
      formatDate(t.date),
      t.type,
      t.category,
      t.detail,
      t.amount,
      t.client?.name || '',
      t.taxCategory,
      t.memo || '',
    ]),
  ];
  const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
  XLSX.utils.book_append_sheet(workbook, transactionSheet, '取引データ');

  // シート3: 領収書データ
  const receiptData = [
    ['アップロード日', '取引日', '店舗名', '合計金額', '消費税', '支払方法'],
    ...data.receipts.map((r) => [
      formatDate(r.uploadedAt),
      r.ocrData?.transactionDate
        ? formatDate(r.ocrData.transactionDate)
        : '未検出',
      r.ocrData?.storeName || '未検出',
      r.ocrData?.totalAmount || 0,
      r.ocrData?.taxAmount || 0,
      r.ocrData?.paymentMethod || '未検出',
    ]),
  ];
  const receiptSheet = XLSX.utils.aoa_to_sheet(receiptData);
  XLSX.utils.book_append_sheet(workbook, receiptSheet, '領収書データ');

  // シート4: 月別集計
  const monthlyData = [
    ['月', '収入', '経費', '利益', '取引件数'],
    ...data.monthlyData.map((m) => [
      `${m.month}月`,
      m.revenue,
      m.expense,
      m.profit,
      m.transactionCount,
    ]),
  ];
  const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(workbook, monthlySheet, '月別集計');

  // シート5: カテゴリ別集計
  const categoryEntries = Object.entries(data.categoryData);
  const categoryData = [
    ['カテゴリ', '収入', '経費', '件数'],
    ...categoryEntries.map(([category, values]) => [
      category,
      values.revenue,
      values.expense,
      values.count,
    ]),
  ];
  const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'カテゴリ別集計');

  // ファイル出力
  XLSX.writeFile(workbook, `年次レポート_${data.year}年.xlsx`);
};

/**
 * 領収書画像をダウンロード（フォルダ構造: 年/月/画像ファイル）
 */
export const downloadReceiptImage = async (
  imageUrl: string,
  receiptId: string,
  date: Date | string
): Promise<{ blob: Blob; path: string }> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');

  // ファイル拡張子を取得
  const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';

  return {
    blob,
    path: `${year}/${month}/${receiptId}.${ext}`,
  };
};

/**
 * 全データをZIPでダウンロード
 */
export const exportAllAsZip = async (
  data: ExportData,
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  const zip = new JSZip();

  // 1. Excelファイルを追加
  const workbook = XLSX.utils.book_new();

  // サマリシート
  const summaryData = [
    ['項目', '金額（円）'],
    ['総収入', data.summary.totalRevenue],
    ['総経費', data.summary.totalExpense],
    ['総利益', data.summary.totalProfit],
    ['取引件数', data.summary.transactionCount],
    ['領収書件数', data.summary.receiptCount],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'サマリ');

  // 取引データシート
  const transactionData = [
    ['日付', '種別', 'カテゴリ', '詳細', '金額', '取引先', '税区分', 'メモ'],
    ...data.transactions.map((t) => [
      formatDate(t.date),
      t.type,
      t.category,
      t.detail,
      t.amount,
      t.client?.name || '',
      t.taxCategory,
      t.memo || '',
    ]),
  ];
  const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
  XLSX.utils.book_append_sheet(workbook, transactionSheet, '取引データ');

  // 領収書データシート
  const receiptData = [
    [
      'アップロード日',
      '取引日',
      '店舗名',
      '合計金額',
      '消費税',
      '支払方法',
      '画像ファイルパス',
    ],
    ...data.receipts.map((r) => {
      const d = r.ocrData?.transactionDate
        ? new Date(r.ocrData.transactionDate)
        : new Date(r.uploadedAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const ext = r.imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const imagePath = `領収書/${year}/${month}/${r.id}.${ext}`;

      return [
        formatDate(r.uploadedAt),
        r.ocrData?.transactionDate
          ? formatDate(r.ocrData.transactionDate)
          : '未検出',
        r.ocrData?.storeName || '未検出',
        r.ocrData?.totalAmount || 0,
        r.ocrData?.taxAmount || 0,
        r.ocrData?.paymentMethod || '未検出',
        imagePath,
      ];
    }),
  ];
  const receiptSheet = XLSX.utils.aoa_to_sheet(receiptData);
  XLSX.utils.book_append_sheet(workbook, receiptSheet, '領収書データ');

  // 月別集計シート
  const monthlyData = [
    ['月', '収入', '経費', '利益', '取引件数'],
    ...data.monthlyData.map((m) => [
      `${m.month}月`,
      m.revenue,
      m.expense,
      m.profit,
      m.transactionCount,
    ]),
  ];
  const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(workbook, monthlySheet, '月別集計');

  // カテゴリ別集計シート
  const categoryEntries = Object.entries(data.categoryData);
  const categoryData = [
    ['カテゴリ', '収入', '経費', '件数'],
    ...categoryEntries.map(([category, values]) => [
      category,
      values.revenue,
      values.expense,
      values.count,
    ]),
  ];
  const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'カテゴリ別集計');

  // Excelファイルを生成してZIPに追加
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });
  zip.file(`年次レポート_${data.year}年.xlsx`, excelBuffer);

  // 2. 領収書画像を追加（フォルダ構造で）
  const total = data.receipts.length;
  for (let i = 0; i < data.receipts.length; i++) {
    const receipt = data.receipts[i];
    try {
      const date = receipt.ocrData?.transactionDate || receipt.uploadedAt;
      const { blob, path } = await downloadReceiptImage(
        receipt.imageUrl,
        receipt.id,
        date
      );
      zip.file(`領収書/${path}`, blob);

      if (onProgress) {
        onProgress(i + 1, total);
      }
    } catch (error) {
      console.error(`Failed to download receipt image: ${receipt.id}`, error);
    }
  }

  // 3. README.txtを追加
  const readmeContent = `年次データエクスポート - ${data.year}年

【ファイル構成】
- 年次レポート_${data.year}年.xlsx: 取引・領収書データと集計表
- 領収書/: 領収書画像（年/月/画像ファイル形式）

【サマリ】
総収入: ¥${data.summary.totalRevenue.toLocaleString()}
総経費: ¥${data.summary.totalExpense.toLocaleString()}
総利益: ¥${data.summary.totalProfit.toLocaleString()}
取引件数: ${data.summary.transactionCount}件
領収書件数: ${data.summary.receiptCount}件

【注意事項】
このデータは年末調整や確定申告の参考資料としてご利用ください。
正式な申告書類としての使用は、税理士または税務署にご確認ください。

エクスポート日時: ${new Date().toLocaleString('ja-JP')}
`;

  zip.file('README.txt', readmeContent);

  // 4. ZIPファイルを生成してダウンロード
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `年次データ_${data.year}年.zip`);
};

/**
 * PDFエクスポート（年次レポート）
 */
export const exportToPDF = (data: ExportData): void => {
  const doc = new jsPDF();

  // フォント設定（日本語対応のため、標準フォントを使用）
  doc.setFont('helvetica');

  // タイトル
  doc.setFontSize(20);
  doc.text(`${data.year} Year Annual Report`, 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Export Date: ${new Date().toLocaleDateString('ja-JP')}`, 105, 30, {
    align: 'center',
  });

  // サマリセクション
  doc.setFontSize(16);
  doc.text('Summary', 14, 45);

  autoTable(doc, {
    startY: 50,
    head: [['Item', 'Amount (JPY)']],
    body: [
      ['Total Revenue', data.summary.totalRevenue.toLocaleString()],
      ['Total Expense', data.summary.totalExpense.toLocaleString()],
      ['Total Profit', data.summary.totalProfit.toLocaleString()],
      ['Transaction Count', data.summary.transactionCount.toString()],
      ['Receipt Count', data.summary.receiptCount.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
  });

  // 月別集計
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Monthly Summary', 14, 20);

  autoTable(doc, {
    startY: 25,
    head: [['Month', 'Revenue', 'Expense', 'Profit', 'Transactions']],
    body: data.monthlyData.map((m) => [
      `${m.month}`,
      m.revenue.toLocaleString(),
      m.expense.toLocaleString(),
      m.profit.toLocaleString(),
      m.transactionCount.toString(),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
  });

  // カテゴリ別集計
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Category Summary', 14, 20);

  const categoryEntries = Object.entries(data.categoryData);
  autoTable(doc, {
    startY: 25,
    head: [['Category', 'Revenue', 'Expense', 'Count']],
    body: categoryEntries.map(([category, values]) => [
      category,
      values.revenue.toLocaleString(),
      values.expense.toLocaleString(),
      values.count.toString(),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
  });

  // 取引明細
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Transaction Details', 14, 20);

  const transactionRows = data.transactions.slice(0, 100).map((t) => [
    formatDate(t.date),
    t.type,
    t.category,
    t.detail.substring(0, 30), // 長い詳細は切り詰め
    t.amount.toLocaleString(),
    t.client?.name || '',
  ]);

  autoTable(doc, {
    startY: 25,
    head: [['Date', 'Type', 'Category', 'Detail', 'Amount', 'Client']],
    body: transactionRows,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 8 },
    columnStyles: {
      3: { cellWidth: 40 }, // Detail列の幅を広く
    },
  });

  if (data.transactions.length > 100) {
    doc.setFontSize(10);
    const lastTable = (
      doc as typeof doc & { lastAutoTable?: { finalY: number } }
    ).lastAutoTable;
    doc.text(
      `* Showing first 100 of ${data.transactions.length} transactions`,
      14,
      lastTable ? lastTable.finalY + 10 : 200
    );
  }

  // 領収書明細
  if (data.receipts.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Receipt Summary', 14, 20);

    const receiptRows = data.receipts
      .slice(0, 100)
      .map((r) => [
        formatDate(r.uploadedAt),
        r.ocrData?.transactionDate
          ? formatDate(r.ocrData.transactionDate)
          : 'N/A',
        r.ocrData?.storeName || 'N/A',
        r.ocrData?.totalAmount?.toLocaleString() || '0',
        r.ocrData?.taxAmount?.toLocaleString() || '0',
        r.ocrData?.paymentMethod || 'N/A',
      ]);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          'Upload Date',
          'Transaction Date',
          'Store',
          'Amount',
          'Tax',
          'Payment',
        ],
      ],
      body: receiptRows,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
    });

    if (data.receipts.length > 100) {
      doc.setFontSize(10);
      const lastTable = (
        doc as typeof doc & { lastAutoTable?: { finalY: number } }
      ).lastAutoTable;
      doc.text(
        `* Showing first 100 of ${data.receipts.length} receipts`,
        14,
        lastTable ? lastTable.finalY + 10 : 200
      );
    }
  }

  // 注意事項ページ
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Important Notes', 14, 20);

  doc.setFontSize(10);
  const notes = [
    '1. This report is for reference purposes only.',
    '2. Please consult with a tax accountant or tax office for official tax filing.',
    '3. Keep original receipts and supporting documents.',
    '4. This data should be used as supplementary material for year-end tax adjustment.',
    '',
    `Generated: ${new Date().toLocaleString('ja-JP')}`,
  ];

  let yPos = 30;
  notes.forEach((note) => {
    doc.text(note, 14, yPos);
    yPos += 7;
  });

  // PDFを保存
  doc.save(`年次レポート_${data.year}年.pdf`);
};
