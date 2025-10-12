import { X, Clock, ChefHat, Flame, Sparkles, Loader2 } from 'lucide-react';
import { GeneratedRecipe } from '../services/aiRecipeService';

type AIRecipeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipes: GeneratedRecipe[];
  isLoading: boolean;
  error?: string;
};

export function AIRecipeModal({ isOpen, onClose, recipes, isLoading, error }: AIRecipeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">AI Recipe Suggestions</h2>
                <p className="text-emerald-100 font-medium">Custom recipes generated just for you</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading && (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Generating Recipes...</h3>
              <p className="text-gray-600 text-lg">Our AI chef is creating custom recipes for you</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                <h3 className="text-2xl font-bold text-red-800 mb-3">Generation Failed</h3>
                <p className="text-red-600 mb-4 text-lg">{error}</p>
                <p className="text-sm text-red-500">
                  Please check your OpenAI API key configuration or try again later.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && recipes.length > 0 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-3">
                  Here are 3 custom recipes for you!
                </h3>
                <p className="text-gray-600 text-lg">
                  Each recipe is tailored to your available ingredients
                </p>
              </div>

              {recipes.map((recipe) => (
                <div key={recipe.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-3">{recipe.name}</h4>
                      <p className="text-gray-600 text-lg leading-relaxed">{recipe.description}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      AI Generated
                    </div>
                  </div>

                  {/* Recipe Stats */}
                  <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold">{recipe.cooking_time} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-gray-500" />
                      <span className="capitalize font-semibold">{recipe.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold">{recipe.calories} cal</span>
                    </div>
                  </div>

                  {/* Diet Type Tags */}
                  {recipe.diet_type.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {recipe.diet_type.map(diet => (
                        <span
                          key={diet}
                          className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-2 rounded-full font-medium shadow-sm"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Nutritional Information */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                    <h5 className="font-bold text-gray-800 mb-4 text-lg">Nutrition (per serving)</h5>
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                        <div className="text-3xl font-bold text-gray-900 mb-1">{recipe.calories}</div>
                        <div className="text-sm text-gray-600 font-medium">Calories</div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                        <div className="text-3xl font-bold text-gray-900 mb-1">{recipe.protein}g</div>
                        <div className="text-sm text-gray-600 font-medium">Protein</div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                        <div className="text-3xl font-bold text-gray-900 mb-1">{recipe.carbs}g</div>
                        <div className="text-sm text-gray-600 font-medium">Carbs</div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                        <div className="text-3xl font-bold text-gray-900 mb-1">{recipe.fat}g</div>
                        <div className="text-sm text-gray-600 font-medium">Fat</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Ingredients */}
                    <div>
                      <h5 className="font-bold text-gray-800 mb-4 text-lg">Ingredients</h5>
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ingredient, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-3">
                            <span className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></span>
                            <span className="font-semibold">{ingredient.name}</span>
                            <span className="text-gray-500">- {ingredient.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h5 className="font-bold text-gray-800 mb-4 text-lg">Instructions</h5>
                      <ol className="space-y-4">
                        {recipe.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Recipes generated by AI • Results may vary
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-200 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
