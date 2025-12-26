'use client';

import { useState } from 'react';
import { Location } from '../types';

interface LocationSelectorProps {
  locations: Location[];
  currentLocationId: string;
  onLocationChange: (locationId: string) => void;
  onLocationAdd: () => void;
  onLocationRemove: (locationId: string) => void;
  onLocationReorder: (locations: Location[]) => void;
  onLocationToggleFavorite: (locationId: string) => void;
}

export default function LocationSelector({
  locations,
  currentLocationId,
  onLocationChange,
  onLocationAdd,
  onLocationRemove,
  onLocationReorder,
  onLocationToggleFavorite,
}: LocationSelectorProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sortedLocations = [...locations].sort((a, b) => a.order - b.order);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLocations = [...sortedLocations];
    const draggedItem = newLocations[draggedIndex];
    newLocations.splice(draggedIndex, 1);
    newLocations.splice(index, 0, draggedItem);

    // Update order property
    const reorderedLocations = newLocations.map((loc, idx) => ({
      ...loc,
      order: idx,
    }));

    onLocationReorder(reorderedLocations);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Current Location Selector */}
      <div className="flex gap-2">
        {sortedLocations.slice(0, 2).map((location) => (
          <button
            key={location.id}
            onClick={() => onLocationChange(location.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              currentLocationId === location.id
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-blue-500/20 text-white hover:bg-blue-500/30'
            }`}
          >
            {location.isFavorite && <span>📍</span>}
            {location.name}
          </button>
        ))}
      </div>

      {/* Add Location Button */}
      <button
        onClick={onLocationAdd}
        className="px-4 py-2 rounded-full text-sm font-medium bg-blue-500/20 text-white hover:bg-blue-500/30 transition-all flex items-center gap-2"
      >
        <span>+</span>
        <span>地点追加</span>
      </button>

      {/* Manage Button */}
      {locations.length > 2 && (
        <button
          onClick={() => setIsManaging(!isManaging)}
          className="px-4 py-2 rounded-full text-sm font-medium bg-blue-500/20 text-white hover:bg-blue-500/30 transition-all"
        >
          {isManaging ? '完了' : '管理'}
        </button>
      )}

      {/* Management Panel */}
      {isManaging && (
        <div className="absolute top-16 left-0 right-0 bg-white rounded-lg shadow-xl p-4 z-10 max-w-md">
          <h3 className="text-lg font-bold mb-4 text-gray-800">地点管理</h3>
          <div className="space-y-2">
            {sortedLocations.map((location, index) => (
              <div
                key={location.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">☰</span>
                  <button
                    onClick={() => onLocationToggleFavorite(location.id)}
                    className={`text-xl ${
                      location.isFavorite ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    {location.isFavorite ? '★' : '☆'}
                  </button>
                  <span className="font-medium text-gray-800">
                    {location.name}
                  </span>
                </div>
                {locations.length > 2 && (
                  <button
                    onClick={() => onLocationRemove(location.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
