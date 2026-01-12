import { google } from 'googleapis';
import { prisma } from './prisma';

/**
 * ユーザーのGoogle認証状態を確認
 */
export async function checkGoogleAuthStatus(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'google',
    },
  });

  if (!account) {
    return {
      isAuthenticated: false,
      hasRefreshToken: false,
      message: 'Google認証情報が見つかりません',
    };
  }

  if (!account.refresh_token) {
    return {
      isAuthenticated: false,
      hasRefreshToken: false,
      message: 'リフレッシュトークンが見つかりません',
    };
  }

  // トークンの有効性を確認
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    await oauth2Client.getAccessToken();

    return {
      isAuthenticated: true,
      hasRefreshToken: true,
      message: 'Google認証は有効です',
    };
  } catch (error: any) {
    // invalid_grantエラーの場合は無効なトークン
    if (error?.message?.includes('invalid_grant') || error?.code === 400) {
      return {
        isAuthenticated: false,
        hasRefreshToken: true,
        isTokenInvalid: true,
        message: 'リフレッシュトークンが無効です。再認証が必要です。',
      };
    }

    return {
      isAuthenticated: false,
      hasRefreshToken: true,
      message: 'トークンの検証中にエラーが発生しました',
      error: error?.message,
    };
  }
}

/**
 * 無効なGoogle認証情報を削除
 */
export async function clearInvalidGoogleAuth(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'google',
    },
  });

  if (account) {
    await prisma.account.delete({
      where: { id: account.id },
    });
    console.log('✅ 無効なGoogle認証情報を削除しました');
    return true;
  }

  return false;
}

/**
 * Google認証のセットアップを確認し、必要に応じてクリア
 */
export async function ensureValidGoogleAuth(userId: string) {
  const status = await checkGoogleAuthStatus(userId);

  if (status.isTokenInvalid) {
    await clearInvalidGoogleAuth(userId);
    throw new Error(
      'Google認証トークンが無効になりました。再度ログインしてください。'
    );
  }

  if (!status.isAuthenticated) {
    throw new Error('Google認証が必要です。ログインしてください。');
  }

  return true;
}
