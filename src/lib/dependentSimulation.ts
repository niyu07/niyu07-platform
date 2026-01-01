/**
 * 扶養シミュレーション関連の型定義と計算ロジック
 */

// 扶養シミュレーションの入力データ
export interface DependentSimulationInput {
  // 本人の情報
  annualIncome: number; // 年収(円)
  isStudent: boolean; // 学生かどうか
  age: number; // 年齢

  // 扶養者(親など)の情報
  dependentOnParent: boolean; // 親の扶養に入っているか
  parentIncome?: number; // 親の年収(円) - 社会保険の扶養判定に使用

  // 追加の働き方情報
  employmentType?: 'employee' | 'parttime' | 'freelance'; // 雇用形態
  workingHours?: number; // 週の労働時間
}

// 年収の壁の情報
export interface IncomeWall {
  amount: number; // 壁の金額
  name: string; // 壁の名前
  description: string; // 説明
  effects: string[]; // 影響
  exceeded: boolean; // 超えているかどうか
}

// 控除額の詳細
export interface DeductionDetails {
  basicDeduction: number; // 基礎控除
  employmentIncomeDeduction: number; // 給与所得控除
  studentDeduction: number; // 勤労学生控除
  socialInsuranceDeduction: number; // 社会保険料控除(概算)
  totalDeduction: number; // 合計控除額
}

// 扶養の状態
export interface DependentStatus {
  // 税制上の扶養
  taxDependent: boolean; // 扶養控除の対象か
  taxDependentDeduction: number; // 扶養者が受けられる控除額

  // 社会保険上の扶養
  socialInsuranceDependent: boolean; // 社会保険の扶養に入れるか
  socialInsuranceLimit: number; // 社会保険の扶養限度額
}

// 手取り計算結果
export interface NetIncomeCalculation {
  grossIncome: number; // 年収
  employmentIncome: number; // 給与所得
  taxableIncome: number; // 課税所得
  incomeTax: number; // 所得税
  residentTax: number; // 住民税
  socialInsurance: number; // 社会保険料
  netIncome: number; // 手取り額
}

// シミュレーション結果
export interface DependentSimulationResult {
  input: DependentSimulationInput;
  deductions: DeductionDetails;
  dependentStatus: DependentStatus;
  netIncome: NetIncomeCalculation;
  incomeWalls: IncomeWall[];
  recommendations: string[]; // おすすめの働き方
  remainingIncome: {
    // あとどのくらい稼げるか
    toNextWall?: {
      wallName: string;
      amount: number;
      netIncomeIncrease: number;
    };
    optimalIncome?: {
      amount: number;
      reason: string;
    };
  };
}

/**
 * 給与所得控除を計算
 * https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
 */
export function calculateEmploymentIncomeDeduction(
  annualIncome: number
): number {
  if (annualIncome <= 550000) return annualIncome; // 55万円以下は全額控除
  if (annualIncome <= 1625000) return 550000;
  if (annualIncome <= 1800000) {
    return Math.floor(annualIncome * 0.4 - 100000);
  }
  if (annualIncome <= 3600000) {
    return Math.floor(annualIncome * 0.3 + 80000);
  }
  if (annualIncome <= 6600000) {
    return Math.floor(annualIncome * 0.2 + 440000);
  }
  if (annualIncome <= 8500000) {
    return Math.floor(annualIncome * 0.1 + 1100000);
  }
  return 1950000; // 上限
}

/**
 * 給与所得を計算
 */
export function calculateEmploymentIncome(annualIncome: number): number {
  return annualIncome - calculateEmploymentIncomeDeduction(annualIncome);
}

/**
 * 基礎控除を計算
 * 2020年以降、所得2400万円以下は48万円
 */
export function calculateBasicDeduction(employmentIncome: number): number {
  if (employmentIncome <= 24000000) return 480000;
  if (employmentIncome <= 24500000) return 320000;
  if (employmentIncome <= 25000000) return 160000;
  return 0;
}

/**
 * 勤労学生控除を計算
 * 給与所得75万円以下(年収130万円以下)で適用
 */
export function calculateStudentDeduction(
  isStudent: boolean,
  employmentIncome: number
): number {
  if (!isStudent) return 0;
  if (employmentIncome <= 750000) return 270000;
  return 0;
}

/**
 * 社会保険料を概算(給与所得者の場合)
 * 年収の約14.4%(健康保険+厚生年金)
 */
export function estimateSocialInsurance(
  annualIncome: number,
  employmentType: string = 'employee'
): number {
  // 短時間労働者の場合、社会保険加入要件を満たさない可能性がある
  // 2024年10月から従業員51人以上の企業は週20時間以上、月収8.8万円以上で加入義務
  if (employmentType === 'parttime' && annualIncome < 1056000) {
    return 0; // 月収8.8万円 × 12ヶ月 = 105.6万円未満は原則非加入
  }

  if (annualIncome < 1056000) return 0;

  // 健康保険: 約5% (事業主と折半で約10%)
  // 厚生年金: 約9.15% (事業主と折半で約18.3%)
  // 雇用保険: 約0.6%
  return Math.floor(annualIncome * 0.1475);
}

/**
 * 所得税を計算(簡易版)
 */
export function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 1950000) return Math.floor(taxableIncome * 0.05);
  if (taxableIncome <= 3300000) {
    return Math.floor(taxableIncome * 0.1 - 97500);
  }
  if (taxableIncome <= 6950000) {
    return Math.floor(taxableIncome * 0.2 - 427500);
  }
  if (taxableIncome <= 9000000) {
    return Math.floor(taxableIncome * 0.23 - 636000);
  }
  if (taxableIncome <= 18000000) {
    return Math.floor(taxableIncome * 0.33 - 1536000);
  }
  if (taxableIncome <= 40000000) {
    return Math.floor(taxableIncome * 0.4 - 2796000);
  }
  return Math.floor(taxableIncome * 0.45 - 4796000);
}

/**
 * 住民税を計算(簡易版)
 * 所得割10% + 均等割5000円
 */
export function calculateResidentTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  // 住民税の非課税限度額(扶養なし): 45万円程度
  if (taxableIncome <= 450000) return 0;
  return Math.floor(taxableIncome * 0.1) + 5000;
}

/**
 * 扶養控除の対象かを判定
 */
export function isDependentForTax(
  age: number,
  employmentIncome: number
): boolean {
  // 16歳以上、給与所得48万円以下(年収103万円以下)
  if (age < 16) return false;
  return employmentIncome <= 480000;
}

/**
 * 扶養者が受けられる控除額を計算
 */
export function calculateDependentDeduction(age: number): number {
  if (age < 16) return 0;
  if (age >= 19 && age <= 22) return 630000; // 特定扶養親族(大学生など)
  if (age >= 70) return 580000; // 老人扶養親族
  return 380000; // 一般の扶養親族
}

/**
 * 社会保険の扶養に入れるかを判定
 */
export function isDependentForSocialInsurance(
  annualIncome: number,
  employmentType: string = 'employee',
  workingHours: number = 0
): { isDependent: boolean; limit: number; reason?: string } {
  // 基本は年収130万円未満
  const limit = 1300000;

  // 106万円の壁: 以下の条件を全て満たすと社会保険加入義務
  // - 従業員51人以上の企業
  // - 週20時間以上勤務
  // - 月収8.8万円以上(年収106万円以上)
  // - 2ヶ月を超える雇用見込み
  // - 学生でない
  if (
    employmentType === 'employee' &&
    workingHours >= 20 &&
    annualIncome >= 1060000
  ) {
    return {
      isDependent: false,
      limit: 1060000,
      reason: '106万円の壁: 社会保険加入義務(週20時間以上)',
    };
  }

  // 130万円未満なら扶養に入れる
  if (annualIncome < limit) {
    return { isDependent: true, limit };
  }

  return {
    isDependent: false,
    limit,
    reason: '年収130万円以上のため社会保険の扶養から外れる',
  };
}

/**
 * 年収の壁を判定
 */
export function getIncomeWalls(input: DependentSimulationInput): IncomeWall[] {
  const {
    annualIncome,
    isStudent,
    employmentType = 'parttime',
    workingHours = 0,
  } = input;

  const walls: IncomeWall[] = [];

  // 100万円の壁(住民税)
  walls.push({
    amount: 1000000,
    name: '100万円の壁',
    description: '住民税が課税される',
    effects: ['住民税の課税が始まる(年間約1万円〜)'],
    exceeded: annualIncome > 1000000,
  });

  // 103万円の壁(所得税・扶養控除)
  const wall103 = {
    amount: 1030000,
    name: '103万円の壁',
    description: '所得税が課税され、親の扶養控除から外れる',
    effects: [
      '所得税の課税が始まる',
      '親が扶養控除を受けられなくなる(親の税金が増える)',
    ],
    exceeded: annualIncome > 1030000,
  };
  if (input.dependentOnParent) {
    const deduction = calculateDependentDeduction(input.age);
    wall103.effects.push(
      `親の税負担増加: 約${Math.floor((deduction * 0.2) / 10000)}〜${Math.floor((deduction * 0.33) / 10000)}万円`
    );
  }
  walls.push(wall103);

  // 106万円の壁(社会保険) - 条件付き
  if (employmentType === 'employee' && workingHours >= 20) {
    walls.push({
      amount: 1060000,
      name: '106万円の壁',
      description: '社会保険加入義務(従業員51人以上の企業)',
      effects: [
        '健康保険・厚生年金の加入義務',
        '社会保険料負担: 年間約15万円',
        '将来の年金額は増える',
      ],
      exceeded: annualIncome > 1060000,
    });
  }

  // 130万円の壁(勤労学生控除の上限 & 社会保険)
  if (isStudent) {
    walls.push({
      amount: 1300000,
      name: '130万円の壁',
      description: '勤労学生控除の上限・社会保険の扶養から外れる',
      effects: [
        '勤労学生控除が使えなくなる',
        '親の社会保険の扶養から外れる',
        '自分で国民健康保険・国民年金に加入(年間約25万円)',
      ],
      exceeded: annualIncome > 1300000,
    });
  } else {
    walls.push({
      amount: 1300000,
      name: '130万円の壁',
      description: '社会保険の扶養から外れる',
      effects: [
        '親の社会保険の扶養から外れる',
        '自分で国民健康保険・国民年金に加入必要',
      ],
      exceeded: annualIncome > 1300000,
    });
  }

  // 150万円の壁(配偶者特別控除の満額)- 学生の場合はあまり関係ないが念のため
  walls.push({
    amount: 1500000,
    name: '150万円の壁',
    description: '配偶者特別控除が減り始める(配偶者の場合)',
    effects: ['※配偶者の場合に関係する壁'],
    exceeded: annualIncome > 1500000,
  });

  // 201万円の壁(配偶者特別控除の終了)
  walls.push({
    amount: 2010000,
    name: '201万円の壁',
    description: '配偶者特別控除が受けられなくなる(配偶者の場合)',
    effects: ['※配偶者の場合に関係する壁'],
    exceeded: annualIncome > 2010000,
  });

  return walls;
}

/**
 * 扶養シミュレーションを実行
 */
export function simulateDependent(
  input: DependentSimulationInput
): DependentSimulationResult {
  const {
    annualIncome,
    isStudent,
    age,
    employmentType = 'parttime',
    workingHours = 0,
  } = input;

  // 給与所得の計算
  const employmentIncome = calculateEmploymentIncome(annualIncome);

  // 各種控除の計算
  const basicDeduction = calculateBasicDeduction(employmentIncome);
  const employmentIncomeDeduction =
    calculateEmploymentIncomeDeduction(annualIncome);
  const studentDeduction = calculateStudentDeduction(
    isStudent,
    employmentIncome
  );

  // 社会保険料の概算
  const socialInsurance = estimateSocialInsurance(annualIncome, employmentType);
  const socialInsuranceDeduction = socialInsurance;

  const totalDeduction =
    basicDeduction + studentDeduction + socialInsuranceDeduction;

  const deductions: DeductionDetails = {
    basicDeduction,
    employmentIncomeDeduction,
    studentDeduction,
    socialInsuranceDeduction,
    totalDeduction,
  };

  // 課税所得の計算
  const taxableIncome = Math.max(0, employmentIncome - totalDeduction);

  // 税金の計算
  const incomeTax = calculateIncomeTax(taxableIncome);
  const residentTax = calculateResidentTax(taxableIncome);

  // 手取り計算
  const netIncome = annualIncome - incomeTax - residentTax - socialInsurance;

  const netIncomeCalculation: NetIncomeCalculation = {
    grossIncome: annualIncome,
    employmentIncome,
    taxableIncome,
    incomeTax,
    residentTax,
    socialInsurance,
    netIncome,
  };

  // 扶養の判定
  const taxDependent = isDependentForTax(age, employmentIncome);
  const taxDependentDeduction = taxDependent
    ? calculateDependentDeduction(age)
    : 0;

  const socialInsuranceResult = isDependentForSocialInsurance(
    annualIncome,
    employmentType,
    workingHours
  );

  const dependentStatus: DependentStatus = {
    taxDependent,
    taxDependentDeduction,
    socialInsuranceDependent: socialInsuranceResult.isDependent,
    socialInsuranceLimit: socialInsuranceResult.limit,
  };

  // 年収の壁
  const incomeWalls = getIncomeWalls(input);

  // おすすめの働き方を生成
  const recommendations = generateRecommendations(
    input,
    netIncomeCalculation,
    dependentStatus,
    incomeWalls
  );

  // あとどのくらい稼げるかを計算
  const remainingIncome = calculateRemainingIncome(
    input,
    incomeWalls,
    netIncomeCalculation
  );

  return {
    input,
    deductions,
    dependentStatus,
    netIncome: netIncomeCalculation,
    incomeWalls,
    recommendations,
    remainingIncome,
  };
}

/**
 * おすすめの働き方を生成
 */
function generateRecommendations(
  input: DependentSimulationInput,
  netIncome: NetIncomeCalculation,
  dependentStatus: DependentStatus,
  walls: IncomeWall[]
): string[] {
  const recommendations: string[] = [];
  const { annualIncome, isStudent, dependentOnParent } = input;

  // 現在の状況説明
  if (annualIncome <= 1030000) {
    recommendations.push(
      '✅ 現在は扶養控除の範囲内です。親の税負担も増えません。'
    );
  }

  if (isStudent && annualIncome <= 1300000 && annualIncome > 1030000) {
    recommendations.push(
      '✅ 勤労学生控除が適用されているため、所得税の負担が軽減されています。'
    );
  }

  // 次の壁までの提案
  const nextWall = walls.find((w) => !w.exceeded);
  if (nextWall) {
    const remaining = nextWall.amount - annualIncome;
    if (remaining > 0 && remaining <= 200000) {
      recommendations.push(
        `💡 次の壁(${nextWall.name})まであと${Math.floor(remaining / 10000)}万円です。この範囲内で働くと効率的です。`
      );
    }
  }

  // 壁を超えた場合の提案
  if (annualIncome > 1030000 && annualIncome < 1300000 && dependentOnParent) {
    if (isStudent) {
      recommendations.push(
        '⚠️ 103万円を超えていますが、勤労学生控除で税負担は抑えられています。ただし親の扶養控除は受けられません。'
      );
    } else {
      recommendations.push(
        '⚠️ 103万円を超えているため、親の扶養控除が受けられません。親の税負担が増えている可能性があります。'
      );
    }
  }

  if (annualIncome > 1300000 && annualIncome < 1500000) {
    recommendations.push(
      '💰 130万円を超えているため、社会保険料の負担が増えています。150万円程度まで働いた方が手取りが増える可能性があります。'
    );
  }

  // 最適な年収帯の提案
  if (annualIncome < 1000000) {
    recommendations.push(
      '📊 扶養範囲内で最大限働きたい場合は、年収103万円(月8.5万円)が目安です。'
    );
  } else if (annualIncome > 1030000 && annualIncome < 1200000) {
    if (isStudent) {
      recommendations.push(
        '📊 学生の場合、年収130万円(月10.8万円)まで勤労学生控除が使えます。'
      );
    }
  }

  // 社会保険の提案
  if (!dependentStatus.socialInsuranceDependent && annualIncome < 1500000) {
    recommendations.push(
      '⚠️ 社会保険の扶養から外れています。将来の年金は増えますが、現在の手取りは減ります。'
    );
  }

  return recommendations;
}

/**
 * あとどのくらい稼げるかを計算
 */
function calculateRemainingIncome(
  input: DependentSimulationInput,
  walls: IncomeWall[],
  currentNetIncome: NetIncomeCalculation
): DependentSimulationResult['remainingIncome'] {
  const { annualIncome } = input;

  // 次の壁を見つける
  const nextWall = walls.find((w) => !w.exceeded);

  if (!nextWall) {
    return {
      optimalIncome: {
        amount: annualIncome,
        reason: '全ての主要な壁を超えています。',
      },
    };
  }

  // 次の壁までの残額
  const remaining = nextWall.amount - annualIncome;

  if (remaining <= 0) {
    return {};
  }

  // 次の壁の手前まで稼いだ場合の手取り増加額を試算
  const simulatedIncome = nextWall.amount - 10000; // 壁の直前
  const simulatedResult = simulateDependent({
    ...input,
    annualIncome: simulatedIncome,
  });

  const netIncomeIncrease =
    simulatedResult.netIncome.netIncome - currentNetIncome.netIncome;

  return {
    toNextWall: {
      wallName: nextWall.name,
      amount: remaining,
      netIncomeIncrease,
    },
    optimalIncome: {
      amount: simulatedIncome,
      reason: `${nextWall.name}を超えないギリギリまで働くのが効率的です。`,
    },
  };
}

/**
 * 複数の年収でシミュレーションを実行(グラフ用)
 */
export function simulateMultipleIncomes(
  input: Omit<DependentSimulationInput, 'annualIncome'>,
  incomes: number[]
): DependentSimulationResult[] {
  return incomes.map((income) =>
    simulateDependent({ ...input, annualIncome: income })
  );
}
