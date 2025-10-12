import { supabase, Recipe } from '../lib/supabase';

export type RecipeFilters = {
  dietType?: string[];
  difficulty?: string;
  maxCookingTime?: number;
};

export type RecipeMatch = Recipe & {
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  substitutions: { missing: string; substitute: string }[];
};

const commonSubstitutions: Record<string, string[]> = {
  'butter': ['olive oil', 'coconut oil', 'margarine'],
  'milk': ['almond milk', 'soy milk', 'coconut milk'],
  'egg': ['flax egg', 'chia egg', 'applesauce'],
  'flour': ['almond flour', 'coconut flour', 'gluten-free flour'],
  'sugar': ['honey', 'maple syrup', 'stevia'],
  'sour cream': ['greek yogurt', 'coconut cream'],
  'cream': ['coconut cream', 'cashew cream'],
  'chicken': ['tofu', 'tempeh', 'seitan'],
  'beef': ['mushrooms', 'lentils', 'beyond meat'],
  'cheese': ['nutritional yeast', 'cashew cheese', 'vegan cheese']
};

function normalizeIngredient(ingredient: string): string {
  return ingredient.toLowerCase().trim().replace(/s$/, '');
}

function findSubstitutions(missingIngredients: string[], userIngredients: string[]): { missing: string; substitute: string }[] {
  const substitutions: { missing: string; substitute: string }[] = [];
  const normalizedUserIngredients = userIngredients.map(normalizeIngredient);

  missingIngredients.forEach(missing => {
    const normalized = normalizeIngredient(missing);
    const possibleSubs = commonSubstitutions[normalized] || [];

    possibleSubs.forEach(sub => {
      if (normalizedUserIngredients.includes(normalizeIngredient(sub))) {
        substitutions.push({ missing, substitute: sub });
      }
    });
  });

  return substitutions;
}

export async function searchRecipes(
  userIngredients: string[],
  filters: RecipeFilters = {}
): Promise<RecipeMatch[]> {
  let query = supabase.from('recipes').select('*');

  if (filters.dietType && filters.dietType.length > 0) {
    query = query.overlaps('diet_type', filters.dietType);
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters.maxCookingTime) {
    query = query.lte('cooking_time', filters.maxCookingTime);
  }

  const { data: recipes, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }

  if (!recipes || recipes.length === 0) {
    return [];
  }

  const normalizedUserIngredients = userIngredients.map(normalizeIngredient);

  const recipesWithScores: RecipeMatch[] = recipes.map(recipe => {
    const recipeIngredients = recipe.ingredients.map((ing: { name: string }) => ing.name);
    const normalizedRecipeIngredients = recipeIngredients.map(normalizeIngredient);

    const matchedIngredients: string[] = [];
    const missingIngredients: string[] = [];

    recipeIngredients.forEach((ingredient: string, index: number) => {
      const normalized = normalizedRecipeIngredients[index];
      const isMatched = normalizedUserIngredients.some(userIng =>
        userIng.includes(normalized) || normalized.includes(userIng)
      );

      if (isMatched) {
        matchedIngredients.push(ingredient);
      } else {
        missingIngredients.push(ingredient);
      }
    });

    const matchScore = recipeIngredients.length > 0
      ? (matchedIngredients.length / recipeIngredients.length) * 100
      : 0;

    const substitutions = findSubstitutions(missingIngredients, userIngredients);

    return {
      ...recipe,
      matchScore,
      matchedIngredients,
      missingIngredients,
      substitutions
    };
  });

  // Filter recipes to only include those with at least 50% ingredient match
  const filteredRecipes = recipesWithScores.filter(recipe => recipe.matchScore >= 50);
  
  return filteredRecipes.sort((a, b) => b.matchScore - a.matchScore);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch recipe: ${error.message}`);
  }

  return data;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }

  return data || [];
}
