import { prisma } from './src/lib/prisma';

async function resetGoogleAuth() {
  try {
    // Googleアカウントを削除（再認証を強制）
    const result = await prisma.account.deleteMany({
      where: {
        provider: 'google',
      },
    });

    console.log(`✅ ${result.count}件のGoogleアカウント情報を削除しました`);
    console.log('次回ログイン時に再度Google認証が必要です');
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetGoogleAuth();
