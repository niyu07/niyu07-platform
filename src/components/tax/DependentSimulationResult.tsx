'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DependentSimulationResult } from '@/lib/dependentSimulation';
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Shield,
  Lightbulb,
  Info,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
} from 'recharts';

interface DependentSimulationResultProps {
  result: DependentSimulationResult;
}

export function DependentSimulationResult({
  result,
}: DependentSimulationResultProps) {
  const {
    deductions,
    dependentStatus,
    netIncome,
    incomeWalls,
    recommendations,
    remainingIncome,
  } = result;

  // グラフ用のデータを生成
  const generateChartData = () => {
    const data = [];
    const step = 100000; // 10万円刻み
    const maxIncome = 2500000; // 最大250万円まで

    for (let income = 0; income <= maxIncome; income += step) {
      // 簡易的な手取り計算(本来は全てsimulateを呼ぶべきだが、パフォーマンスのため簡略化)
      const ratio = income / result.input.annualIncome;
      const estimated = {
        income,
        netIncome: Math.floor(netIncome.netIncome * ratio),
      };
      data.push(estimated);
    }

    return data;
  };

  const chartData = generateChartData();

  // 年収の壁をグラフに表示するための設定
  const wallColors: { [key: string]: string } = {
    '100万円の壁': '#fbbf24',
    '103万円の壁': '#fb923c',
    '106万円の壁': '#f87171',
    '130万円の壁': '#ef4444',
    '150万円の壁': '#dc2626',
    '201万円の壁': '#991b1b',
  };

  return (
    <div className="space-y-6">
      {/* 控除額の詳細 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            控除額の詳細
          </CardTitle>
          <CardDescription>各種控除の内訳を表示しています</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">給与所得控除</span>
              <span className="font-semibold">
                {deductions.employmentIncomeDeduction.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">基礎控除</span>
              <span className="font-semibold">
                {deductions.basicDeduction.toLocaleString()}円
              </span>
            </div>
            {deductions.studentDeduction > 0 && (
              <div className="flex justify-between py-2 border-b bg-blue-50 px-2 rounded">
                <span className="text-gray-600">勤労学生控除</span>
                <span className="font-semibold text-blue-600">
                  {deductions.studentDeduction.toLocaleString()}円
                </span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">社会保険料控除(概算)</span>
              <span className="font-semibold">
                {deductions.socialInsuranceDeduction.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between py-3 bg-gray-50 px-3 rounded-lg">
              <span className="font-semibold">合計控除額</span>
              <span className="font-bold text-lg text-blue-600">
                {deductions.totalDeduction.toLocaleString()}円
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 手取り額の詳細 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            手取り額の計算
          </CardTitle>
          <CardDescription>
            年収から各種税金・保険料を差し引いた金額
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">年収(総支給額)</span>
              <span className="font-semibold">
                {netIncome.grossIncome.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between py-2 text-sm text-gray-500">
              <span className="pl-4">- 給与所得</span>
              <span>{netIncome.employmentIncome.toLocaleString()}円</span>
            </div>
            <div className="flex justify-between py-2 text-sm text-gray-500">
              <span className="pl-4">- 課税所得</span>
              <span>{netIncome.taxableIncome.toLocaleString()}円</span>
            </div>
            <div className="border-t pt-2"></div>
            <div className="flex justify-between py-2 text-red-600">
              <span>所得税</span>
              <span>-{netIncome.incomeTax.toLocaleString()}円</span>
            </div>
            <div className="flex justify-between py-2 text-red-600">
              <span>住民税</span>
              <span>-{netIncome.residentTax.toLocaleString()}円</span>
            </div>
            <div className="flex justify-between py-2 text-red-600">
              <span>社会保険料</span>
              <span>-{netIncome.socialInsurance.toLocaleString()}円</span>
            </div>
            <div className="border-t pt-3"></div>
            <div className="flex justify-between py-3 bg-green-50 px-3 rounded-lg">
              <span className="font-bold text-lg">手取り額</span>
              <span className="font-bold text-2xl text-green-600">
                {netIncome.netIncome.toLocaleString()}円
              </span>
            </div>
            <div className="text-center text-sm text-gray-500">
              手取り率:{' '}
              {((netIncome.netIncome / netIncome.grossIncome) * 100).toFixed(1)}
              %
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 扶養の状態 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            扶養の状態
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
              {dependentStatus.taxDependent ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">税制上の扶養</div>
                <div className="text-sm text-gray-600 mt-1">
                  {dependentStatus.taxDependent ? (
                    <>
                      扶養控除の対象です
                      {dependentStatus.taxDependentDeduction > 0 && (
                        <div className="mt-1">
                          親が受けられる控除額:{' '}
                          <span className="font-semibold text-blue-600">
                            {dependentStatus.taxDependentDeduction.toLocaleString()}
                            円
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    '扶養控除の対象外です(年収103万円超)'
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
              {dependentStatus.socialInsuranceDependent ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">社会保険上の扶養</div>
                <div className="text-sm text-gray-600 mt-1">
                  {dependentStatus.socialInsuranceDependent ? (
                    <>
                      扶養の範囲内です
                      <div className="mt-1">
                        限度額:{' '}
                        <span className="font-semibold">
                          {dependentStatus.socialInsuranceLimit.toLocaleString()}
                          円
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      扶養から外れています
                      <div className="mt-1 text-orange-600">
                        自分で社会保険に加入する必要があります
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 年収の壁の可視化 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            年収の壁
          </CardTitle>
          <CardDescription>
            各種制度の境界となる年収ラインと現在地
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {incomeWalls.slice(0, 5).map((wall) => (
              <div
                key={wall.name}
                className={`p-4 rounded-lg border-2 ${
                  wall.exceeded
                    ? 'bg-red-50 border-red-300'
                    : 'bg-blue-50 border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-lg">{wall.name}</div>
                  <div className="font-bold">
                    {wall.amount.toLocaleString()}円
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {wall.description}
                </div>
                <div className="text-xs text-gray-600">
                  {wall.effects.map((effect, i) => (
                    <div key={i} className="flex items-start mt-1">
                      <span className="mr-1">•</span>
                      <span>{effect}</span>
                    </div>
                  ))}
                </div>
                {wall.exceeded && (
                  <div className="mt-2 text-sm font-semibold text-red-600">
                    ✓ 超えています
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 年収の壁グラフ */}
          <div className="mt-6">
            <h4 className="font-semibold mb-3">年収の壁と手取り額の関係</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="income"
                  tickFormatter={(value) => `${value / 10000}万`}
                />
                <YAxis tickFormatter={(value) => `${value / 10000}万`} />
                <Tooltip
                  formatter={(value) =>
                    value ? `${Number(value).toLocaleString()}円` : ''
                  }
                  labelFormatter={(label) =>
                    `年収: ${Number(label).toLocaleString()}円`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="netIncome"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="手取り額"
                />
                {incomeWalls.slice(0, 4).map((wall) => (
                  <ReferenceLine
                    key={wall.name}
                    x={wall.amount}
                    stroke={wallColors[wall.name] || '#6b7280'}
                    strokeDasharray="3 3"
                    label={{
                      value: wall.name,
                      position: 'top',
                      fill: wallColors[wall.name] || '#6b7280',
                      fontSize: 12,
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* あとどのくらい稼げるか */}
      {remainingIncome.toNextWall && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <TrendingUp className="mr-2 h-5 w-5" />
              あとどのくらい稼げるか
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  次の壁: {remainingIncome.toNextWall.wallName}
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <div>
                      あと{' '}
                      <span className="font-bold text-lg text-blue-600">
                        {remainingIncome.toNextWall.amount.toLocaleString()}円
                      </span>{' '}
                      稼ぐことができます
                    </div>
                    <div className="text-sm">
                      この範囲内で働いた場合の手取り増加額(概算):{' '}
                      <span className="font-semibold">
                        +
                        {remainingIncome.toNextWall.netIncomeIncrease.toLocaleString()}
                        円
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {remainingIncome.optimalIncome && (
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="font-semibold mb-2">最適な年収</div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {remainingIncome.optimalIncome.amount.toLocaleString()}円
                  </div>
                  <div className="text-sm text-gray-600">
                    {remainingIncome.optimalIncome.reason}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* おすすめの働き方 */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-900">
            <Lightbulb className="mr-2 h-5 w-5" />
            おすすめの働き方
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 bg-white p-3 rounded-lg"
              >
                <div className="text-green-600 font-bold">{index + 1}.</div>
                <div className="flex-1 text-gray-700">{recommendation}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
