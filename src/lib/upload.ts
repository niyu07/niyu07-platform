import {
  supabase,
  RECEIPTS_BUCKET,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from './supabase';

// 定数を再エクスポート
export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES };

export interface UploadedFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  publicUrl: string;
}

/**
 * ファイルのバリデーション
 */
export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / 1024 / 1024}MBまでです。`,
    };
  }

  // ファイルタイプチェック
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `このファイルタイプは許可されていません。PDF、JPG、PNGのみ対応しています。`,
    };
  }

  return { valid: true };
}

/**
 * ファイルをSupabase Storageにアップロード
 */
export async function uploadFile(
  file: File,
  userId: string,
  transactionId: string
): Promise<UploadedFile> {
  // バリデーション
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // ファイル名を安全な形式に変換
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${timestamp}_${safeFileName}`;

  // ストレージパス: userId/transactionId/filename
  const filePath = `${userId}/${transactionId}/${fileName}`;

  try {
    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`アップロードに失敗しました: ${error.message}`);
    }

    // アップロードされたファイルの公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(data.path);

    return {
      id: data.id || data.path,
      fileName: safeFileName,
      filePath: data.path,
      fileSize: file.size,
      fileType: file.type,
      publicUrl,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error instanceof Error
      ? error
      : new Error('ファイルのアップロードに失敗しました');
  }
}

/**
 * 複数のファイルをアップロード
 */
export async function uploadFiles(
  files: File[],
  userId: string,
  transactionId: string
): Promise<UploadedFile[]> {
  const uploadPromises = files.map((file) =>
    uploadFile(file, userId, transactionId)
  );

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
}

/**
 * ファイルを削除
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`ファイルの削除に失敗しました: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error instanceof Error
      ? error
      : new Error('ファイルの削除に失敗しました');
  }
}

/**
 * 複数のファイルを削除
 */
export async function deleteFiles(filePaths: string[]): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .remove(filePaths);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`ファイルの削除に失敗しました: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting files:', error);
    throw error instanceof Error
      ? error
      : new Error('ファイルの削除に失敗しました');
  }
}

/**
 * ファイルの署名付きURLを取得(プライベートバケット用)
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      throw new Error(`署名付きURLの取得に失敗しました: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error instanceof Error
      ? error
      : new Error('署名付きURLの取得に失敗しました');
  }
}
