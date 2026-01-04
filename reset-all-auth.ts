import { prisma } from './src/lib/prisma';

async function resetAllAuth() {
  try {
    console.log('🔄 Resetting all authentication data...');

    // すべてのアカウントを削除
    const accounts = await prisma.account.deleteMany({});
    console.log(`✅ Deleted ${accounts.count} accounts`);

    // すべてのセッションを削除
    const sessions = await prisma.session.deleteMany({});
    console.log(`✅ Deleted ${sessions.count} sessions`);

    // すべてのユーザーを削除
    const users = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${users.count} users`);

    console.log('✅ All authentication data has been reset');
    console.log('👉 Please sign in again at http://localhost:3000/auth/signin');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAllAuth();
