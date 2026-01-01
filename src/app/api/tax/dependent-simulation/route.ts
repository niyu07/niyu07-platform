import { NextRequest, NextResponse } from 'next/server';
import {
  DependentSimulationInput,
  simulateDependent,
  simulateMultipleIncomes,
} from '@/lib/dependentSimulation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/tax/dependent-simulation
 * 扶養シミュレーションを実行
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    if (typeof body.annualIncome !== 'number' || body.annualIncome < 0) {
      return NextResponse.json(
        { error: '年収は0以上の数値で入力してください' },
        { status: 400 }
      );
    }

    if (typeof body.isStudent !== 'boolean') {
      return NextResponse.json(
        { error: '学生かどうかを選択してください' },
        { status: 400 }
      );
    }

    if (typeof body.age !== 'number' || body.age < 0 || body.age > 120) {
      return NextResponse.json(
        { error: '年齢は0〜120の範囲で入力してください' },
        { status: 400 }
      );
    }

    const input: DependentSimulationInput = {
      annualIncome: body.annualIncome,
      isStudent: body.isStudent,
      age: body.age,
      dependentOnParent: body.dependentOnParent ?? false,
      parentIncome: body.parentIncome,
      employmentType: body.employmentType || 'parttime',
      workingHours: body.workingHours || 0,
    };

    const result = simulateDependent(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error('扶養シミュレーションエラー:', error);
    return NextResponse.json(
      { error: 'シミュレーションの実行に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tax/dependent-simulation/batch
 * 複数の年収でシミュレーションを実行(グラフ用)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.incomes)) {
      return NextResponse.json(
        { error: 'incomesは配列で指定してください' },
        { status: 400 }
      );
    }

    const input: Omit<DependentSimulationInput, 'annualIncome'> = {
      isStudent: body.isStudent ?? false,
      age: body.age ?? 20,
      dependentOnParent: body.dependentOnParent ?? false,
      parentIncome: body.parentIncome,
      employmentType: body.employmentType || 'parttime',
      workingHours: body.workingHours || 0,
    };

    const results = simulateMultipleIncomes(input, body.incomes);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('一括シミュレーションエラー:', error);
    return NextResponse.json(
      { error: 'シミュレーションの実行に失敗しました' },
      { status: 500 }
    );
  }
}
