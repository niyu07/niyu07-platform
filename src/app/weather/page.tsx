'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import LocationSelector from './components/LocationSelector';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import HourlyForecast from './components/HourlyForecast';
import WeeklyForecast from './components/WeeklyForecast';
import PrecipitationChart from './components/PrecipitationChart';
import TemperatureChart from './components/TemperatureChart';
import EventWeatherIntegration from './components/EventWeatherIntegration';
import {
  mockLocations,
  mockCurrentWeather,
  mockHourlyForecast,
  mockDailyForecast,
  mockCalendarEvents,
  mockSuggestions,
  mockWeatherAlerts,
} from './mockData';
import { Location } from './types';

export default function WeatherPage() {
  const [locations, setLocations] = useState(mockLocations);
  const [currentLocationId, setCurrentLocationId] = useState('tokyo-shibuya');

  const currentLocation = locations.find((loc) => loc.id === currentLocationId);

  const handleLocationChange = (locationId: string) => {
    setCurrentLocationId(locationId);
  };

  const handleLocationAdd = () => {
    // In a real app, this would open a dialog to add a new location
    const newLocation: Location = {
      id: `location-${Date.now()}`,
      name: '新しい地点',
      latitude: 0,
      longitude: 0,
      isFavorite: false,
      order: locations.length,
    };
    setLocations([...locations, newLocation]);
  };

  const handleLocationRemove = (locationId: string) => {
    setLocations(locations.filter((loc) => loc.id !== locationId));
  };

  const handleLocationReorder = (newLocations: Location[]) => {
    setLocations(newLocations);
  };

  const handleLocationToggleFavorite = (locationId: string) => {
    setLocations(
      locations.map((loc) =>
        loc.id === locationId ? { ...loc, isFavorite: !loc.isFavorite } : loc
      )
    );
  };

  const user = {
    name: '山田太郎',
    email: 'yamada@example.com',
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} currentPage="天気" />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          {/* Header with Location Selector */}
          <div className="relative">
            <LocationSelector
              locations={locations}
              currentLocationId={currentLocationId}
              onLocationChange={handleLocationChange}
              onLocationAdd={handleLocationAdd}
              onLocationRemove={handleLocationRemove}
              onLocationReorder={handleLocationReorder}
              onLocationToggleFavorite={handleLocationToggleFavorite}
            />
          </div>

          {/* Current Weather */}
          {currentLocation && (
            <CurrentWeatherCard
              weather={mockCurrentWeather}
              location={currentLocation}
            />
          )}

          {/* 24 Hour Forecast */}
          <HourlyForecast forecasts={mockHourlyForecast} />

          {/* Weekly Forecast */}
          <WeeklyForecast forecasts={mockDailyForecast} />

          {/* Two Column Layout for Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Precipitation Chart */}
            <PrecipitationChart
              forecasts={mockHourlyForecast}
              alerts={mockWeatherAlerts}
            />

            {/* Temperature Chart */}
            <TemperatureChart
              forecasts={mockHourlyForecast}
              currentWeather={mockCurrentWeather}
            />
          </div>

          {/* Event Weather Integration */}
          <EventWeatherIntegration
            events={mockCalendarEvents}
            forecasts={mockHourlyForecast}
            suggestions={mockSuggestions}
          />
        </div>
      </main>
    </div>
  );
}
