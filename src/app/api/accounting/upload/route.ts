import { NextRequest, NextResponse } from 'next/server';
import { uploadFiles, deleteFile } from '@/lib/upload';
import { supabase, RECEIPTS_BUCKET } from '@/lib/supabase';

/**
 * ファイルアップロードAPI
 * multipart/form-dataでファイルを受け取り、Supabase Storageにアップロード
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const userId = formData.get('userId') as string;
    const transactionId = formData.get('transactionId') as string;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: 'transactionId is required' },
        { status: 400 }
      );
    }

    // ファイルを取得
    const files: File[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value);
      }
    });

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log(
      `[POST /api/accounting/upload] Uploading ${files.length} files for user ${userId}, transaction ${transactionId}`
    );

    // ファイルをアップロード
    const uploadedFiles = await uploadFiles(files, userId, transactionId);

    console.log(
      `[POST /api/accounting/upload] Successfully uploaded ${uploadedFiles.length} files`
    );

    return NextResponse.json(
      {
        success: true,
        files: uploadedFiles,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/accounting/upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload files',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * ファイルダウンロード/プレビューAPI
 * GET /api/accounting/upload?action=download&filePath=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json(
        { error: 'filePath is required' },
        { status: 400 }
      );
    }

    if (action === 'download') {
      // ファイルをSupabase Storageからダウンロード
      const { data, error } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .download(filePath);

      if (error) {
        console.error('[GET /api/accounting/upload] Download error:', error);
        return NextResponse.json(
          { error: 'Failed to download file', details: error.message },
          { status: 500 }
        );
      }

      // ファイル名を抽出
      const fileName = filePath.split('/').pop() || 'download';

      // ファイルをBlobとして返す
      return new NextResponse(data, {
        headers: {
          'Content-Type': data.type,
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use action=download' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[GET /api/accounting/upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * ファイル削除API
 * DELETE /api/accounting/upload
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'filePath is required' },
        { status: 400 }
      );
    }

    console.log(`[DELETE /api/accounting/upload] Deleting file: ${filePath}`);

    // ファイルを削除
    await deleteFile(filePath);

    console.log(`[DELETE /api/accounting/upload] Successfully deleted file`);

    return NextResponse.json(
      {
        success: true,
        message: 'File deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/accounting/upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
