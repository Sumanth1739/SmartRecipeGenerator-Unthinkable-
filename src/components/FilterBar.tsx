import { Filter } from 'lucide-react';
import { RecipeFilters } from '../services/recipeService';

type FilterBarProps = {
  filters: RecipeFilters;
  onFilterChange: (filters: RecipeFilters) => void;
};

const dietOptions = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' }
];

const difficultyOptions = [
  { value: '', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
];

const timeOptions = [
  { value: '', label: 'Any time' },
  { value: '20', label: 'Under 20 min' },
  { value: '30', label: 'Under 30 min' },
  { value: '60', label: 'Under 1 hour' }
];

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const handleDietToggle = (diet: string) => {
    const currentDiets = filters.dietType || [];
    const newDiets = currentDiets.includes(diet)
      ? currentDiets.filter(d => d !== diet)
      : [...currentDiets, diet];
    onFilterChange({ ...filters, dietType: newDiets });
  };

  const handleDifficultyChange = (difficulty: string) => {
    onFilterChange({ ...filters, difficulty: difficulty || undefined });
  };

  const handleTimeChange = (time: string) => {
    onFilterChange({ ...filters, maxCookingTime: time ? parseInt(time) : undefined });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <h2 className="font-bold text-xl text-gray-800">Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Dietary Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {dietOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleDietToggle(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filters.dietType?.includes(option.value)
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Difficulty
          </label>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:shadow-lg focus:shadow-emerald-100 outline-none transition-all duration-200 hover:border-gray-400"
          >
            {difficultyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cooking Time
          </label>
          <select
            value={filters.maxCookingTime || ''}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:shadow-lg focus:shadow-emerald-100 outline-none transition-all duration-200 hover:border-gray-400"
          >
            {timeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
