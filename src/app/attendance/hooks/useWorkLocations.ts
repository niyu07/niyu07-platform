import { useState, useEffect, useCallback } from 'react';
import { WorkLocation } from '@/app/types';

export function useWorkLocations(userId: string | null) {
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 勤務先一覧を取得
  const fetchWorkLocations = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setWorkLocations([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });
      const response = await fetch(`/api/work-locations?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[useWorkLocations] API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData.error || errorData.details || 'Failed to fetch work locations');
      }

      const data = await response.json();
      setWorkLocations(data);
    } catch (err) {
      console.error('Error fetching work locations:', err);
      setError('勤務先の取得に失敗しました');
      setWorkLocations([]); // エラー時は空配列をセット
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 勤務先を追加
  const addWorkLocation = useCallback(
    async (location: Omit<WorkLocation, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!userId) return;

      try {
        const response = await fetch('/api/work-locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            ...location,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add work location');
        }

        const newLocation = await response.json();
        setWorkLocations((prev) => [newLocation, ...prev]);
      } catch (err) {
        console.error('Error adding work location:', err);
        throw err;
      }
    },
    [userId]
  );

  // 勤務先を更新
  const updateWorkLocation = useCallback(
    async (id: string, updates: Partial<WorkLocation>) => {
      try {
        const response = await fetch('/api/work-locations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            ...updates,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update work location');
        }

        const updatedLocation = await response.json();
        setWorkLocations((prev) =>
          prev.map((loc) => (loc.id === id ? updatedLocation : loc))
        );
      } catch (err) {
        console.error('Error updating work location:', err);
        throw err;
      }
    },
    []
  );

  // 勤務先を削除
  const deleteWorkLocation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/work-locations?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete work location');
      }

      setWorkLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err: any) {
      console.error('Error deleting work location:', err);
      throw err;
    }
  }, []);

  // 初期ロード
  useEffect(() => {
    if (userId) {
      fetchWorkLocations();
    }
  }, [userId, fetchWorkLocations]);

  return {
    workLocations,
    isLoading,
    error,
    addWorkLocation,
    updateWorkLocation,
    deleteWorkLocation,
    refetch: fetchWorkLocations,
  };
}
