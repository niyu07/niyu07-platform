'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { DependentSimulationInput } from '@/lib/dependentSimulation';
import { Calculator } from 'lucide-react';

interface DependentSimulationFormProps {
  onSubmit: (input: DependentSimulationInput) => void;
  isLoading?: boolean;
  initialValues?: DependentSimulationInput | null;
}

export function DependentSimulationForm({
  onSubmit,
  isLoading = false,
  initialValues,
}: DependentSimulationFormProps) {
  const getInitialFormData = () => {
    return (
      initialValues || {
        annualIncome: 0,
        isStudent: true,
        age: 20,
        dependentOnParent: true,
        employmentType: 'parttime',
        workingHours: 0,
      }
    );
  };

  const [formData, setFormData] =
    useState<Partial<DependentSimulationInput>>(getInitialFormData);

  const updateFormData = (data: Partial<DependentSimulationInput>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.annualIncome !== undefined &&
      formData.isStudent !== undefined &&
      formData.age !== undefined
    ) {
      onSubmit(formData as DependentSimulationInput);
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>条件を入力</CardTitle>
        <CardDescription>年収や働き方の情報を入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 年収 */}
          <div>
            <Label htmlFor="annualIncome">年収(円)</Label>
            <Input
              id="annualIncome"
              type="number"
              value={formData.annualIncome || ''}
              onChange={(e) =>
                updateFormData({ annualIncome: Number(e.target.value) })
              }
              placeholder="例: 1000000"
              min="0"
              step="10000"
              className="mt-1"
              required
            />
          </div>

          {/* 年齢 */}
          <div>
            <Label htmlFor="age">年齢</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={(e) => updateFormData({ age: Number(e.target.value) })}
              placeholder="例: 20"
              min="0"
              max="120"
              className="mt-1"
              required
            />
          </div>

          {/* 学生かどうか */}
          <div>
            <Label>学生ですか?</Label>
            <RadioGroup
              value={formData.isStudent ? 'yes' : 'no'}
              onValueChange={(value) =>
                updateFormData({ isStudent: value === 'yes' })
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="student-yes" />
                <Label htmlFor="student-yes" className="font-normal text-sm">
                  はい
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="student-no" />
                <Label htmlFor="student-no" className="font-normal text-sm">
                  いいえ
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 雇用形態 */}
          <div>
            <Label>雇用形態</Label>
            <RadioGroup
              value={formData.employmentType || 'parttime'}
              onValueChange={(value) =>
                updateFormData({
                  employmentType: value as
                    | 'employee'
                    | 'parttime'
                    | 'freelance',
                })
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parttime" id="employment-parttime" />
                <Label
                  htmlFor="employment-parttime"
                  className="font-normal text-sm"
                >
                  アルバイト・パート
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee" id="employment-employee" />
                <Label
                  htmlFor="employment-employee"
                  className="font-normal text-sm"
                >
                  正社員
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="freelance" id="employment-freelance" />
                <Label
                  htmlFor="employment-freelance"
                  className="font-normal text-sm"
                >
                  フリーランス
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 週の労働時間 */}
          <div>
            <Label htmlFor="workingHours">週の労働時間</Label>
            <Input
              id="workingHours"
              type="number"
              value={formData.workingHours || ''}
              onChange={(e) =>
                updateFormData({ workingHours: Number(e.target.value) })
              }
              placeholder="例: 20"
              min="0"
              max="168"
              className="mt-1"
            />
          </div>

          {/* 親の扶養 */}
          <div>
            <Label>親の扶養に入っていますか?</Label>
            <RadioGroup
              value={formData.dependentOnParent ? 'yes' : 'no'}
              onValueChange={(value) =>
                updateFormData({ dependentOnParent: value === 'yes' })
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="dependent-yes" />
                <Label htmlFor="dependent-yes" className="font-normal text-sm">
                  はい
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="dependent-no" />
                <Label htmlFor="dependent-no" className="font-normal text-sm">
                  いいえ
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 親の年収（任意） */}
          {formData.dependentOnParent && (
            <div>
              <Label htmlFor="parentIncome">親の年収(円) ※任意</Label>
              <Input
                id="parentIncome"
                type="number"
                value={formData.parentIncome || ''}
                onChange={(e) =>
                  updateFormData({ parentIncome: Number(e.target.value) })
                }
                placeholder="例: 5000000"
                min="0"
                step="100000"
                className="mt-1"
              />
            </div>
          )}

          {/* 送信ボタン */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            <Calculator className="mr-2 h-4 w-4" />
            {isLoading ? '計算中...' : 'シミュレーション実行'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
