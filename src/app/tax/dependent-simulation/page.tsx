'use client';

import { useState } from 'react';
import { DependentSimulationForm } from '@/components/tax/DependentSimulationForm';
import { DependentSimulationResult as ResultComponent } from '@/components/tax/DependentSimulationResult';
import type {
  DependentSimulationInput,
  DependentSimulationResult,
} from '@/lib/dependentSimulation';

export default function DependentSimulationPage() {
  const [result, setResult] = useState<DependentSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentInput, setCurrentInput] =
    useState<DependentSimulationInput | null>(null);

  const handleSimulation = async (input: DependentSimulationInput) => {
    setIsLoading(true);
    setCurrentInput(input);

    try {
      const response = await fetch('/api/tax/dependent-simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('シミュレーションに失敗しました');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('シミュレーションエラー:', error);
      alert('シミュレーションの実行に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">扶養シミュレーション</h1>
        <p className="text-gray-600">
          年収の壁を可視化し、あとどのくらい稼げるかを計算します
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側: 入力フォーム */}
        <div className="lg:col-span-1">
          <DependentSimulationForm
            onSubmit={handleSimulation}
            isLoading={isLoading}
            initialValues={currentInput}
          />
        </div>

        {/* 右側: 結果表示 */}
        <div className="lg:col-span-2">
          {result ? (
            <ResultComponent result={result} />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center p-8">
                <p className="text-gray-500 text-lg mb-2">
                  左側のフォームに入力して
                </p>
                <p className="text-gray-500">
                  シミュレーションを実行してください
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
