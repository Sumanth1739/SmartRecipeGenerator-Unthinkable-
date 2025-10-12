import { Clock, ChefHat, Heart, Star } from 'lucide-react';
import { RecipeMatch } from '../services/recipeService';

type RecipeCardProps = {
  recipe: RecipeMatch;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  userRating: number | null;
};

export function RecipeCard({ recipe, onClick, isFavorite, onToggleFavorite, userRating }: RecipeCardProps) {
  return (
    <div
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <button
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-2.5 rounded-full shadow-lg transition-all hover:bg-white hover:scale-110 hover:shadow-xl"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
        {recipe.matchScore > 0 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            {Math.round(recipe.matchScore)}% match
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-bold text-xl mb-3 text-gray-800 line-clamp-1">{recipe.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{recipe.description}</p>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.cooking_time} min</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        </div>

        {recipe.diet_type.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.diet_type.map(diet => (
              <span
                key={diet}
                className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full font-medium shadow-sm"
              >
                {diet}
              </span>
            ))}
          </div>
        )}

        {userRating && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">Your rating: {userRating}/5</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
          <span className="font-medium">{recipe.calories} cal</span>
          <span>•</span>
          <span className="font-medium">{recipe.protein}g protein</span>
        </div>
      </div>
    </div>
  );
}
