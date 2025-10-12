import { X, Clock, ChefHat, Star, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { RecipeMatch } from '../services/recipeService';
import { useState } from 'react';

type RecipeModalProps = {
  recipe: RecipeMatch;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  userRating: number | null;
  onRatingChange: (rating: number) => void;
};

export function RecipeModal({
  recipe,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  userRating,
  onRatingChange
}: RecipeModalProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  if (!isOpen) return null;

  const handleRatingClick = (rating: number) => {
    onRatingChange(rating);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="relative h-64 overflow-hidden">
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl font-bold text-white mb-2">{recipe.name}</h2>
              <div className="flex items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.cooking_time} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="w-4 h-4" />
                  <span className="capitalize">{recipe.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                {recipe.diet_type.map(diet => (
                  <span
                    key={diet}
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                  >
                    {diet}
                  </span>
                ))}
              </div>
              <button
                onClick={onToggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isFavorite
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Nutrition (per serving)</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{recipe.calories}</div>
                  <div className="text-xs text-gray-600">Calories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{recipe.protein}g</div>
                  <div className="text-xs text-gray-600">Protein</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{recipe.carbs}g</div>
                  <div className="text-xs text-gray-600">Carbs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{recipe.fat}g</div>
                  <div className="text-xs text-gray-600">Fat</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Rate this recipe</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= (hoveredRating || userRating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {userRating && (
                  <span className="ml-2 text-sm text-gray-600">Your rating: {userRating}/5</span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Ingredients</h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ing, index) => {
                  const isMatched = recipe.matchedIngredients.includes(ing.name);
                  const isMissing = recipe.missingIngredients.includes(ing.name);
                  const substitution = recipe.substitutions.find(sub => sub.missing === ing.name);

                  return (
                    <div key={index} className="flex items-start gap-3">
                      {isMatched ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className={`${isMissing ? 'text-gray-500' : 'text-gray-900'}`}>
                          <span className="font-medium">{ing.name}</span> - {ing.quantity}
                        </div>
                        {substitution && (
                          <div className="text-sm text-blue-600 mt-1">
                            💡 You can substitute with: {substitution.substitute}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Instructions</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
