'use client';

import { Transaction, TransactionType } from '../../types';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { validateFile, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/upload';

interface TransactionInputProps {
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  onSuccess?: () => void;
  onCancelEdit?: () => void;
}

export default function TransactionInput({
  initialType = '収入',
  editingTransaction = null,
  onSuccess,
  onCancelEdit,
}: TransactionInputProps) {
  const { data: session } = useSession();
  const [transactionType, setTransactionType] =
    useState<TransactionType>(initialType);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [detail, setDetail] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [client, setClient] = useState<string>('');
  const [clientType, setClientType] = useState<'法人' | '個人'>('法人');
  const [memo, setMemo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingFiles, setExistingFiles] = useState<
    Array<{ filePath: string; fileName: string }>
  >([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [replacingFileIndex, setReplacingFileIndex] = useState<number | null>(
    null
  );
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [customIncomeCategories, setCustomIncomeCategories] = useState<
    string[]
  >([]);
  const [customExpenseCategories, setCustomExpenseCategories] = useState<
    string[]
  >([]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 編集モード時にフォームを初期化
  useEffect(() => {
    if (editingTransaction) {
      setTransactionType(editingTransaction.type);
      setDate(editingTransaction.date.split('T')[0]);
      setDetail(editingTransaction.detail);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setClient(editingTransaction.client || '');
      setMemo(editingTransaction.memo || '');

      // 既存ファイルを設定
      if (
        editingTransaction.attachments &&
        editingTransaction.attachments.length > 0
      ) {
        setExistingFiles(editingTransaction.attachments);
      } else {
        setExistingFiles([]);
      }
      setFilesToDelete([]);
    } else {
      // 新規作成モードに戻った時はフォームをリセット
      setTransactionType(initialType);
      setDate(new Date().toISOString().split('T')[0]);
      setDetail('');
      setAmount('');
      setCategory('');
      setClient('');
      setMemo('');
      setFiles([]);
      setExistingFiles([]);
      setFilesToDelete([]);
    }
  }, [editingTransaction, initialType]);

  // カスタムカテゴリを取得
  useEffect(() => {
    const loadCustomCategories = () => {
      try {
        const savedIncome = localStorage.getItem('customIncomeCategories');
        const savedExpense = localStorage.getItem('customExpenseCategories');
        if (savedIncome) {
          setCustomIncomeCategories(JSON.parse(savedIncome));
        }
        if (savedExpense) {
          setCustomExpenseCategories(JSON.parse(savedExpense));
        }
      } catch (error) {
        console.error('Error loading custom categories:', error);
      }
    };
    loadCustomCategories();
  }, []);

  // カテゴリの選択肢
  const defaultIncomeCategories = ['業務委託', '広告', '販売', 'その他'];
  const defaultExpenseCategories = [
    '消耗品費',
    '通信費',
    '会議費',
    '旅費交通費',
    '外注費',
    '地代家賃',
    '水道光熱費',
    '交際費',
    '雑費',
  ];

  const incomeCategories = [
    ...defaultIncomeCategories,
    ...customIncomeCategories,
  ];
  const expenseCategories = [
    ...defaultExpenseCategories,
    ...customExpenseCategories,
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email) {
      alert('ログインが必要です');
      return;
    }

    if (!category) {
      alert('カテゴリを選択してください');
      return;
    }

    if (!detail || detail.trim() === '') {
      alert('案件名を入力してください');
      return;
    }

    if (!amount || amount === '0') {
      alert('金額を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const isEdit = !!editingTransaction;

      // まず取引を登録
      const url = isEdit
        ? `/api/accounting/transactions?id=${editingTransaction.id}`
        : '/api/accounting/transactions';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.email,
          date,
          type: transactionType,
          category,
          detail,
          amount: parseInt(amount, 10),
          clientName: client || null,
          clientType,
          memo,
          taxCategory: '課税',
          attachments: [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        throw new Error(
          error.details ||
            error.error ||
            `取引の${isEdit ? '更新' : '登録'}に失敗しました`
        );
      }

      const data = await response.json();
      console.log(`Transaction ${isEdit ? 'updated' : 'created'}:`, data);

      // 削除予定のファイルを削除
      if (filesToDelete.length > 0) {
        for (const filePath of filesToDelete) {
          try {
            const deleteResponse = await fetch('/api/accounting/upload', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ filePath }),
            });

            if (!deleteResponse.ok) {
              console.error(`Failed to delete file: ${filePath}`);
            }
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        }
      }

      // 新しいファイルがある場合はアップロード
      let newAttachments: Array<{ filePath: string; fileName: string }> = [];
      if (files.length > 0) {
        const formData = new FormData();
        formData.append('userId', session.user.email);
        formData.append('transactionId', data.id);

        files.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });

        const uploadResponse = await fetch('/api/accounting/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(
            uploadError.details || 'ファイルのアップロードに失敗しました'
          );
        }

        const uploadData = await uploadResponse.json();
        console.log('Files uploaded:', uploadData.files);
        newAttachments = uploadData.files.map(
          (f: { filePath: string; fileName: string }) => ({
            filePath: f.filePath,
            fileName: f.fileName,
          })
        );
      }

      // 編集モードの場合、既存ファイル + 新しいファイルで更新
      if (isEdit) {
        const allAttachments = [...existingFiles, ...newAttachments];
        await fetch(`/api/accounting/transactions?id=${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            attachments: allAttachments,
          }),
        });
      } else if (newAttachments.length > 0) {
        // 新規作成の場合、新しいファイルのみで更新
        await fetch(`/api/accounting/transactions?id=${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            attachments: newAttachments,
          }),
        });
      }

      // フォームをリセット
      setDate(new Date().toISOString().split('T')[0]);
      setDetail('');
      setAmount('');
      setCategory('');
      setClient('');
      setMemo('');
      setFiles([]);
      setExistingFiles([]);
      setFilesToDelete([]);

      alert(`${transactionType}を${isEdit ? '更新' : '登録'}しました！`);

      // 親コンポーネントに成功を通知
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert(
        error instanceof Error ? error.message : '取引の登録に失敗しました'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraft = () => {
    alert('下書きとして保存しました');
  };

  // ファイル選択ハンドラー
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  // ファイル追加
  const addFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }
  };

  // ファイル削除
  const handleFileRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ドラッグ&ドロップハンドラー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  // ファイル選択エリアクリック
  const handleFileAreaClick = () => {
    fileInputRef.current?.click();
  };

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 既存ファイルを削除予定に追加
  const handleExistingFileRemove = (filePath: string) => {
    setFilesToDelete((prev) => [...prev, filePath]);
    setExistingFiles((prev) => prev.filter((f) => f.filePath !== filePath));
  };

  // ファイルダウンロード
  const handleFileDownload = async (filePath: string, fileName: string) => {
    try {
      const response = await fetch(
        `/api/accounting/upload?action=download&filePath=${encodeURIComponent(filePath)}`
      );
      if (!response.ok) throw new Error('ダウンロードに失敗しました');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('ファイルのダウンロードに失敗しました');
    }
  };

  // ファイルプレビュー
  const handleFilePreview = async (filePath: string) => {
    try {
      const response = await fetch(
        `/api/accounting/upload?action=download&filePath=${encodeURIComponent(filePath)}`
      );
      if (!response.ok) throw new Error('プレビューに失敗しました');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // URLは新しいウィンドウで開かれるので、少し遅延してからクリーンアップ
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Preview error:', error);
      alert('ファイルのプレビューに失敗しました');
    }
  };

  // ファイル置き換えボタンをクリック
  const handleReplaceFileClick = (index: number) => {
    setReplacingFileIndex(index);
    replaceFileInputRef.current?.click();
  };

  // ファイル置き換え
  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (replacingFileIndex === null) return;

    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) {
      setReplacingFileIndex(null);
      return;
    }

    const newFile = selectedFiles[0];
    const validation = validateFile(newFile);

    if (!validation.valid) {
      alert(validation.error);
      setReplacingFileIndex(null);
      return;
    }

    // 既存ファイルを削除予定に追加
    const fileToReplace = existingFiles[replacingFileIndex];
    setFilesToDelete((prev) => [...prev, fileToReplace.filePath]);

    // 既存ファイルリストから削除
    setExistingFiles((prev) => prev.filter((_, i) => i !== replacingFileIndex));

    // 新しいファイルを追加
    setFiles((prev) => [...prev, newFile]);

    setReplacingFileIndex(null);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
    }
  };

  // カテゴリ選択時の処理
  const handleCategoryChange = (value: string) => {
    if (value === '__ADD_NEW__') {
      setShowCategoryInput(true);
      setCategory('');
    } else {
      setCategory(value);
      setShowCategoryInput(false);
    }
  };

  // 新しいカテゴリを追加
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert('カテゴリ名を入力してください');
      return;
    }

    const isIncome = transactionType === '収入';
    const currentCategories = isIncome ? incomeCategories : expenseCategories;

    // 重複チェック
    if (currentCategories.includes(newCategoryName.trim())) {
      alert('このカテゴリは既に存在します');
      return;
    }

    // カスタムカテゴリに追加
    if (isIncome) {
      const updated = [...customIncomeCategories, newCategoryName.trim()];
      setCustomIncomeCategories(updated);
      localStorage.setItem('customIncomeCategories', JSON.stringify(updated));
    } else {
      const updated = [...customExpenseCategories, newCategoryName.trim()];
      setCustomExpenseCategories(updated);
      localStorage.setItem('customExpenseCategories', JSON.stringify(updated));
    }

    // 追加したカテゴリを選択
    setCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowCategoryInput(false);
  };

  // カテゴリ追加をキャンセル
  const handleCancelAddCategory = () => {
    setShowCategoryInput(false);
    setNewCategoryName('');
  };

  const recentClients = [
    '株式会社A',
    '株式会社B',
    '株式会社C',
    '個人クライアントD',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        {/* 編集モード時のヘッダー */}
        {editingTransaction && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">取引を編集</h2>
                <p className="text-sm text-gray-600 mt-1">
                  取引ID: {editingTransaction.id}
                </p>
              </div>
              {onCancelEdit && (
                <button
                  onClick={onCancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
              )}
            </div>
          </div>
        )}

        {/* 種類切り替え */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTransactionType('収入')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              transactionType === '収入'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            売上
          </button>
          <button
            onClick={() => setTransactionType('経費')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              transactionType === '経費'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            経費
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日付
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              例: 2025年12月25日 (木)
            </p>
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
              <span className="text-red-500 ml-1">*</span>
            </label>
            {!showCategoryInput ? (
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {(transactionType === '収入'
                  ? incomeCategories
                  : expenseCategories
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option
                  value="__ADD_NEW__"
                  className="text-blue-600 font-medium"
                >
                  + 新しいカテゴリを追加
                </option>
              </select>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="新しいカテゴリ名を入力"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      } else if (e.key === 'Escape') {
                        handleCancelAddCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    追加
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAddCategory}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Enterキーで追加、Escキーでキャンセル
                </p>
              </div>
            )}
          </div>

          {/* 取引先 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              取引先
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="例: 株式会社○○"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {client === '' && recentClients.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                過去の取引先: {recentClients.slice(0, 3).join('、')}...
              </div>
            )}
          </div>

          {/* 案件名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件名
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="例: Webサイトデザイン"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              金額（税込）
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                ¥
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                min="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 取引先区分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              取引先区分
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clientType"
                  value="法人"
                  checked={clientType === '法人'}
                  onChange={() => setClientType('法人')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">法人（源泉徴収あり）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clientType"
                  value="個人"
                  checked={clientType === '個人'}
                  onChange={() => setClientType('個人')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">個人（源泉徴収なし）</span>
              </label>
            </div>
          </div>

          {/* 詳細・メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              詳細・メモ
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="取引の詳細や特記事項を入力..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 領収書・請求書 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              領収書・請求書
            </label>

            {/* ファイルアップロードエリア */}
            <div
              onClick={handleFileAreaClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="text-4xl mb-2">📤</div>
              <p className="text-gray-600">
                ファイルをドロップ または クリックで選択
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG (最大{MAX_FILE_SIZE / 1024 / 1024}MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* 既存ファイル一覧（編集モード時） */}
            {existingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  既存のファイル ({existingFiles.length})
                </p>
                {existingFiles.map((file, index) => (
                  <div
                    key={`existing-${file.filePath}-${index}`}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl">
                        {file.fileName.toLowerCase().endsWith('.pdf')
                          ? '📄'
                          : '🖼️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-blue-600">
                          アップロード済み
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFilePreview(file.filePath)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        aria-label="プレビュー"
                        title="プレビュー"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleFileDownload(file.filePath, file.fileName)
                        }
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        aria-label="ダウンロード"
                        title="ダウンロード"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReplaceFileClick(index)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        aria-label="ファイルを変更"
                        title="変更"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExistingFileRemove(file.filePath)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label="ファイルを削除"
                        title="削除"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ファイル置き換え用のhidden input */}
            <input
              ref={replaceFileInputRef}
              type="file"
              accept={ALLOWED_FILE_TYPES.join(',')}
              onChange={handleReplaceFile}
              className="hidden"
            />

            {/* アップロードされたファイル一覧 */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  新しく追加するファイル ({files.length})
                </p>
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl">
                        {file.type === 'application/pdf' ? '📄' : '🖼️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileRemove(index)}
                      className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      aria-label="ファイルを削除"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex gap-4 pt-4">
            {!editingTransaction && (
              <button
                type="button"
                onClick={handleDraft}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下書き保存
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                transactionType === '収入'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting
                ? `${editingTransaction ? '更新' : '登録'}中...`
                : editingTransaction
                  ? `${transactionType}を更新`
                  : `${transactionType}を登録`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
