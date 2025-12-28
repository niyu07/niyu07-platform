'use client';

import { useState } from 'react';
import { User, BusinessInfo, DependentInfo } from '@/app/types';

const PREFECTURES = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

export default function AccountSettings() {
  const [user, setUser] = useState<User>({
    id: 'user-1',
    name: '山田太郎',
    email: 'yamada@example.com',
    avatar: '',
    phoneNumber: '090-1234-5678',
    occupation: 'Webデザイナー',
    dateOfBirth: '',
    companyName: '山田デザイン事務所',
  });

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    foundedDate: '',
    blueReturnNumber: '',
    businessDescription: '例: Webデザイン、グラフィックデザイン',
    address: {
      postalCode: '150-0001',
      prefecture: '東京都',
      city: '渋谷区',
      street: '神宮前',
      building: '',
    },
  });

  const [dependentInfo, setDependentInfo] = useState<DependentInfo>({
    parentIncomeRange: undefined,
    usingStudentPensionExemption: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePostalCode = (code: string): boolean => {
    const postalRegex = /^\d{3}-\d{4}$/;
    return postalRegex.test(code);
  };

  const handlePostalCodeSearch = async () => {
    if (!businessInfo.address) return;

    const postalCode = businessInfo.address.postalCode.replace('-', '');
    if (postalCode.length !== 7) {
      setErrors({ ...errors, postalCode: '郵便番号は7桁で入力してください' });
      return;
    }

    // 実際の実装では郵便番号APIを使用
    // 例: https://zipcloud.ibsnet.co.jp/api/search?zipcode=1500001
    alert('郵便番号検索機能は開発中です');
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!user.name.trim()) {
      newErrors.name = '名前は必須です';
    }

    if (!user.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!validateEmail(user.email)) {
      newErrors.email = 'メールアドレスが不正です';
    }

    if (
      businessInfo.address &&
      !validatePostalCode(businessInfo.address.postalCode)
    ) {
      newErrors.postalCode = '郵便番号はXXX-XXXX形式で入力してください';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('保存しました');
      console.log('User:', user);
      console.log('BusinessInfo:', businessInfo);
      console.log('DependentInfo:', dependentInfo);
    }
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">アカウント設定</h2>
        <p className="text-sm text-gray-600 mt-1">
          プロフィール情報や事業情報の管理
        </p>
      </div>

      {/* プロフィール */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">プロフィール</h3>

        {/* 写真 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            写真
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              写真を変更
            </button>
          </div>
        </div>

        {/* 名前とメール */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validateEmail(user.email) && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  ✓
                </span>
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* 屋号と電話番号 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              屋号 (個人事業主)
            </label>
            <input
              type="text"
              value={user.companyName}
              onChange={(e) =>
                setUser({ ...user, companyName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田デザイン事務所"
            />
            <p className="text-xs text-gray-500 mt-1">
              確定申告書類に使用されます
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              電話番号 (任意)
            </label>
            <input
              type="tel"
              value={user.phoneNumber}
              onChange={(e) =>
                setUser({ ...user, phoneNumber: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="090-1234-5678"
            />
          </div>
        </div>

        {/* 職業と生年月日 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              職業
            </label>
            <input
              type="text"
              value={user.occupation}
              onChange={(e) => setUser({ ...user, occupation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Webデザイナー"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生年月日
            </label>
            <input
              type="date"
              value={user.dateOfBirth}
              onChange={(e) =>
                setUser({ ...user, dateOfBirth: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="YYYY/MM/DD"
            />
            <p className="text-xs text-gray-500 mt-1">
              扶養判定の計算に使用します
            </p>
          </div>
        </div>
      </div>

      {/* 事業情報 */}
      <div className="space-y-6 pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900">事業情報</h3>

        {/* 開業日と青色申告承認番号 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開業日
            </label>
            <input
              type="date"
              value={businessInfo.foundedDate}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  foundedDate: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">確定申告の計算に使用</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              青色申告承認番号 (任意)
            </label>
            <input
              type="text"
              value={businessInfo.blueReturnNumber}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  blueReturnNumber: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 事業内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            事業内容
          </label>
          <textarea
            value={businessInfo.businessDescription}
            onChange={(e) =>
              setBusinessInfo({
                ...businessInfo,
                businessDescription: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="例: Webデザイン、グラフィックデザイン"
          />
        </div>

        {/* 事業所所在地 */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            事業所所在地
          </label>

          {/* 郵便番号 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={businessInfo.address?.postalCode}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  address: {
                    ...businessInfo.address!,
                    postalCode: e.target.value,
                  },
                })
              }
              className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="150-0001"
            />
            <button
              onClick={handlePostalCodeSearch}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              住所検索
            </button>
          </div>
          {errors.postalCode && (
            <p className="text-red-500 text-sm">{errors.postalCode}</p>
          )}

          {/* 都道府県と市区町村 */}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={businessInfo.address?.prefecture}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  address: {
                    ...businessInfo.address!,
                    prefecture: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={businessInfo.address?.city}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  address: { ...businessInfo.address!, city: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="市区町村"
            />
          </div>

          {/* 番地 */}
          <input
            type="text"
            value={businessInfo.address?.street}
            onChange={(e) =>
              setBusinessInfo({
                ...businessInfo,
                address: { ...businessInfo.address!, street: e.target.value },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="番地"
          />

          {/* 建物名 */}
          <input
            type="text"
            value={businessInfo.address?.building}
            onChange={(e) =>
              setBusinessInfo({
                ...businessInfo,
                address: { ...businessInfo.address!, building: e.target.value },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="建物名 (任意)"
          />
        </div>
      </div>

      {/* 扶養者情報 */}
      <div className="space-y-6 pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900">扶養者情報</h3>
        <p className="text-sm text-gray-600">
          扶養判定の精度向上のために入力してください
        </p>

        {/* 親の年収 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            親 (扶養者) の年収 <span className="text-gray-400">の年収</span>
          </label>
          <select
            value={dependentInfo.parentIncomeRange || ''}
            onChange={(e) =>
              setDependentInfo({
                ...dependentInfo,
                parentIncomeRange: (e.target.value ||
                  undefined) as DependentInfo['parentIncomeRange'],
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            <option value="0-103">0〜103万円</option>
            <option value="103-150">103〜150万円</option>
            <option value="150-201">150〜201万円</option>
            <option value="201+">201万円以上</option>
          </select>
        </div>

        {/* 国民年金 学生納付特例 */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="pension"
            checked={dependentInfo.usingStudentPensionExemption}
            onChange={(e) =>
              setDependentInfo({
                ...dependentInfo,
                usingStudentPensionExemption: e.target.checked,
              })
            }
            className="mt-1 w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="pension" className="text-sm text-gray-700">
            <span className="font-medium">国民年金 学生納付特例を使用中</span>
            <p className="text-xs text-gray-500 mt-1">
              年金保険料は全額控除対象です
            </p>
          </label>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-lg"
        >
          変更を保存
        </button>
      </div>
    </div>
  );
}
