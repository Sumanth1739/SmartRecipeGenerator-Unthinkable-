import { useState, useEffect } from 'react';
import { ChefHat, Heart, Home, Loader2, LogIn } from 'lucide-react';
import { IngredientInput } from './components/IngredientInput';
import { FilterBar } from './components/FilterBar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeModal } from './components/RecipeModal';
import { AIRecipeModal } from './components/AIRecipeModal';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { searchRecipes, getAllRecipes, RecipeFilters, RecipeMatch } from './services/recipeService';
import { getFavorites, addFavorite, removeFavorite, updateRating, isFavorite as checkIsFavorite } from './services/favoritesService';
import { generateAIRecipes, GeneratedRecipe } from './services/aiRecipeService';
import { supabase } from './lib/supabase';

type View = 'search' | 'favorites';

type User = {
  id: string;
  email: string;
  full_name?: string;
};

function App() {
  const [view, setView] = useState<View>('search');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [recipes, setRecipes] = useState<RecipeMatch[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeMatch | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Map<string, number>>(new Map());
  const [hasSearched, setHasSearched] = useState(false);
  
  // AI Recipe Generation State
  const [aiRecipes, setAiRecipes] = useState<GeneratedRecipe[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Initialize authentication
    initializeAuth();
    loadFavorites();
  }, []);

  const initializeAuth = async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name
        });
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name
            });
            // Reload favorites when user signs in
            loadFavorites();
          } else {
            setUser(null);
            // Clear favorites when user signs out
            setFavorites(new Set());
            setFavoriteRecipes([]);
            setRatings(new Map());
          }
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favData = await getFavorites();
      const favIds = new Set(favData.map(f => f.recipe_id));
      setFavorites(favIds);

      const ratingsMap = new Map<string, number>();
      favData.forEach(f => {
        if (f.rating) {
          ratingsMap.set(f.recipe_id, f.rating);
        }
      });
      setRatings(ratingsMap);

      if (favIds.size > 0) {
        const allRecipes = await getAllRecipes();
        const favRecipes = allRecipes
          .filter(r => favIds.has(r.id))
          .map(r => ({
            ...r,
            matchScore: 0,
            matchedIngredients: [],
            missingIngredients: [],
            substitutions: []
          }));
        setFavoriteRecipes(favRecipes);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await searchRecipes(ingredients, filters);
      setRecipes(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISuggest = async () => {
    if (ingredients.length === 0) return;

    setIsGeneratingAI(true);
    setAiError(null);
    setShowAIModal(true);
    
    try {
      const result = await generateAIRecipes(ingredients);
      if (result.success) {
        setAiRecipes(result.recipes);
      } else {
        setAiError(result.error || 'Failed to generate recipes');
      }
    } catch (error) {
      console.error('AI recipe generation failed:', error);
      setAiError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleToggleFavorite = async (recipeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const isFav = await checkIsFavorite(recipeId);

      if (isFav) {
        await removeFavorite(recipeId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
        setFavoriteRecipes(prev => prev.filter(r => r.id !== recipeId));
      } else {
        await addFavorite(recipeId);
        setFavorites(prev => new Set(prev).add(recipeId));

        const allRecipes = await getAllRecipes();
        const recipe = allRecipes.find(r => r.id === recipeId);
        if (recipe) {
          setFavoriteRecipes(prev => [...prev, {
            ...recipe,
            matchScore: 0,
            matchedIngredients: [],
            missingIngredients: [],
            substitutions: []
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleRatingChange = async (recipeId: string, rating: number) => {
    try {
      const isFav = await checkIsFavorite(recipeId);

      if (!isFav) {
        await addFavorite(recipeId, rating);
        setFavorites(prev => new Set(prev).add(recipeId));
      } else {
        await updateRating(recipeId, rating);
      }

      setRatings(prev => {
        const newMap = new Map(prev);
        newMap.set(recipeId, rating);
        return newMap;
      });
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Smart Recipe Generator
                </h1>
                <p className="text-sm text-gray-600 font-medium">Discover recipes from your ingredients</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('search')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  view === 'search'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={() => setView('favorites')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  view === 'favorites'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Favorites</span>
                {favorites.size > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                    {favorites.size}
                  </span>
                )}
              </button>

              {/* Authentication Section */}
              {isLoadingAuth ? (
                <div className="flex items-center gap-2 px-4 py-3">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <UserProfile 
                  user={user} 
                  onSignOut={() => setUser(null)}
                  favoritesCount={favorites.size}
                />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 hover:shadow-lg hover:shadow-slate-200 transition-all duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'search' ? (
          <>
            <IngredientInput
              ingredients={ingredients}
              onIngredientsChange={setIngredients}
              onSearch={handleSearch}
              onAISuggest={handleAISuggest}
              isLoading={isLoading}
            />

            <FilterBar filters={filters} onFilterChange={setFilters} />

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Finding perfect recipes for you...</p>
              </div>
            )}

            {!isLoading && hasSearched && recipes.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white rounded-xl shadow-md p-12 max-w-md mx-auto">
                  <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No recipes found</h3>
                  <p className="text-gray-600 mb-4">
                    We only show recipes where you have at least 50% of the required ingredients.
                  </p>
                  <p className="text-gray-600">
                    Try adding more ingredients or adjusting your filters.
                  </p>
                </div>
              </div>
            )}

            {!isLoading && hasSearched && recipes.length > 0 && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600">
                    Showing recipes with 50%+ ingredient match, sorted by best match
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => setSelectedRecipe(recipe)}
                      isFavorite={favorites.has(recipe.id)}
                      onToggleFavorite={(e) => handleToggleFavorite(recipe.id, e)}
                      userRating={ratings.get(recipe.id) || null}
                    />
                  ))}
                </div>
              </>
            )}

            {!isLoading && !hasSearched && (
              <div className="text-center py-20">
                <div className="bg-white rounded-xl shadow-md p-12 max-w-md mx-auto">
                  <ChefHat className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to cook?</h3>
                  <p className="text-gray-600">
                    Enter your ingredients above to discover delicious recipes you can make right now!
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Favorite Recipes</h2>
              <p className="text-gray-600">
                {favoriteRecipes.length} saved recipe{favoriteRecipes.length !== 1 ? 's' : ''}
              </p>
            </div>

            {favoriteRecipes.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-xl shadow-md p-12 max-w-md mx-auto">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No favorites yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start saving recipes you love by clicking the heart icon.
                  </p>
                  <button
                    onClick={() => setView('search')}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Discover Recipes
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => setSelectedRecipe(recipe)}
                    isFavorite={true}
                    onToggleFavorite={(e) => handleToggleFavorite(recipe.id, e)}
                    userRating={ratings.get(recipe.id) || null}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isFavorite={favorites.has(selectedRecipe.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedRecipe.id)}
          userRating={ratings.get(selectedRecipe.id) || null}
          onRatingChange={(rating) => handleRatingChange(selectedRecipe.id, rating)}
        />
      )}

      <AIRecipeModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        recipes={aiRecipes}
        isLoading={isGeneratingAI}
        error={aiError || undefined}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <h3 className="font-semibold text-gray-800 mb-3">About This App</h3>
            <p className="text-sm leading-relaxed max-w-3xl mx-auto">
              The Smart Recipe Generator uses an ingredient-based matching algorithm to suggest recipes from a curated database.
              When you enter ingredients, the system calculates a match score by comparing your available items against each recipe's requirements.
              Recipes are ranked by percentage match, with higher scores indicating you have more of the needed ingredients.
              The app also suggests substitutions when you're missing key items, helping you make the most of what you have.
              All recipe data, favorites, and ratings are stored in a Supabase database with real-time synchronization.
              The filtering system allows you to narrow results by dietary preferences, difficulty level, and cooking time.
              Built with React, TypeScript, and Tailwind CSS for a responsive, modern user experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
