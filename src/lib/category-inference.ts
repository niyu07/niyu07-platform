/**
 * カテゴリ自動推測ユーティリティ
 * 店舗名や品目からカテゴリを推測する
 */

interface CategoryRule {
  keywords: string[];
  category: string;
}

// 経費カテゴリのマッピングルール
const expenseCategoryRules: CategoryRule[] = [
  // 交通費
  {
    keywords: [
      'JR',
      '鉄道',
      '電車',
      'バス',
      'タクシー',
      '地下鉄',
      'メトロ',
      '交通',
      '運賃',
      '切符',
      'Suica',
      'PASMO',
      'ICOCA',
      '高速',
      'ETC',
      'ガソリン',
      'エネオス',
      'ENEOS',
      '出光',
      '昭和シェル',
    ],
    category: '交通費',
  },
  // 通信費
  {
    keywords: [
      'NTT',
      'ドコモ',
      'au',
      'ソフトバンク',
      '楽天モバイル',
      '携帯',
      '電話',
      '通信',
      'プロバイダ',
      'インターネット',
      'WiFi',
    ],
    category: '通信費',
  },
  // 接待交際費
  {
    keywords: [
      'レストラン',
      '居酒屋',
      'カフェ',
      '喫茶',
      'スターバックス',
      'ドトール',
      'タリーズ',
      '飲食',
      'ランチ',
      'ディナー',
      '会食',
      'bar',
      'BAR',
    ],
    category: '接待交際費',
  },
  // 消耗品費
  {
    keywords: [
      '文具',
      '文房具',
      '事務用品',
      'コピー用紙',
      'ボールペン',
      'ノート',
      'クリアファイル',
      'マスク',
      '洗剤',
      'ティッシュ',
      '消耗品',
      '100円',
      'ダイソー',
      'セリア',
      'キャンドゥ',
    ],
    category: '消耗品費',
  },
  // 会議費
  {
    keywords: [
      '会議室',
      'ミーティングルーム',
      'レンタルスペース',
      '貸会議室',
      'コワーキング',
    ],
    category: '会議費',
  },
  // 図書費・研修費
  {
    keywords: [
      '書籍',
      '本',
      '書店',
      '紀伊國屋',
      'ジュンク堂',
      '丸善',
      'Amazon',
      'セミナー',
      '研修',
      '講座',
      'スクール',
      '教育',
    ],
    category: '研修費',
  },
  // 広告宣伝費
  {
    keywords: [
      '広告',
      'Google Ads',
      'Facebook広告',
      'Instagram広告',
      'Twitter広告',
      '宣伝',
      'チラシ',
      'ポスター',
      '印刷',
    ],
    category: '広告宣伝費',
  },
  // 水道光熱費
  {
    keywords: ['電気', '水道', 'ガス', '東京電力', '東京ガス', '大阪ガス'],
    category: '水道光熱費',
  },
  // 地代家賃
  {
    keywords: ['家賃', '賃料', '事務所', 'オフィス', '駐車場'],
    category: '地代家賃',
  },
  // ソフトウェア・サブスクリプション
  {
    keywords: [
      'Adobe',
      'Microsoft',
      'Apple',
      'Google',
      'Zoom',
      'Slack',
      'Notion',
      'Dropbox',
      'AWS',
      'Azure',
      'サブスク',
      'subscription',
      'SaaS',
      'クラウド',
    ],
    category: 'ソフトウェア費',
  },
  // 荷造運賃
  {
    keywords: [
      '郵便',
      '宅配',
      'ヤマト',
      '佐川',
      '日本郵便',
      'ゆうパック',
      '宅急便',
      '配送',
      '送料',
    ],
    category: '荷造運賃',
  },
];

/**
 * 店舗名と品目からカテゴリを推測する
 * @param storeName 店舗名
 * @param items 品目リスト
 * @returns 推測されたカテゴリ（見つからない場合はnull）
 */
export function inferCategory(
  storeName: string | null,
  items: Array<{ name: string; price?: number }>
): string | null {
  const searchText = [storeName || '', ...items.map((item) => item.name)].join(
    ' '
  );

  // ルールに基づいてマッチングを試みる
  for (const rule of expenseCategoryRules) {
    for (const keyword of rule.keywords) {
      if (searchText.includes(keyword)) {
        return rule.category;
      }
    }
  }

  // マッチするルールがない場合はnull
  return null;
}

/**
 * カテゴリ推測の信頼度を計算する
 * @param storeName 店舗名
 * @param items 品目リスト
 * @param inferredCategory 推測されたカテゴリ
 * @returns 信頼度（0.0 - 1.0）
 */
export function calculateInferenceConfidence(
  storeName: string | null,
  items: Array<{ name: string; price?: number }>,
  inferredCategory: string | null
): number {
  if (!inferredCategory) return 0;

  const searchText = [storeName || '', ...items.map((item) => item.name)].join(
    ' '
  );

  // マッチしたキーワード数をカウント
  const matchedRule = expenseCategoryRules.find(
    (rule) => rule.category === inferredCategory
  );
  if (!matchedRule) return 0;

  let matchCount = 0;
  for (const keyword of matchedRule.keywords) {
    if (searchText.includes(keyword)) {
      matchCount++;
    }
  }

  // キーワードが複数マッチするほど信頼度が高い
  return Math.min(matchCount * 0.3, 1.0);
}
