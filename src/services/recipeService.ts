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
  if (!ingredient) return "";
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
  let query = supabase.from('recipes').select('*, ingredients, instructions, image_url');

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
    // Support both [{name: string}] and [string] ingredient formats
    const recipeIngredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map((ing: any) => typeof ing === "string" ? ing : ing?.name)
      : [];
    const filteredRecipeIngredients = recipeIngredients.filter((name: string | undefined): name is string => !!name);
    const normalizedRecipeIngredients = filteredRecipeIngredients.map(normalizeIngredient);

    // Debug logs
    console.log('Normalized user ingredients:', normalizedUserIngredients);
    console.log('Normalized recipe ingredients:', normalizedRecipeIngredients);

    const matchedIngredients: string[] = [];
    const missingIngredients: string[] = [];

    normalizedRecipeIngredients.forEach((normalized, index) => {
      const isMatched = normalizedUserIngredients.some(userIng =>
        userIng === normalized // strict match
      );

      if (isMatched) {
        matchedIngredients.push(filteredRecipeIngredients[index]);
      } else {
        missingIngredients.push(filteredRecipeIngredients[index]);
      }
    });

    const matchScore = filteredRecipeIngredients.length > 0
      ? (matchedIngredients.length / filteredRecipeIngredients.length) * 100
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

  // Only include recipes with more than 50% ingredient match
  const filteredRecipes = recipesWithScores.filter(recipe => recipe.matchScore > 50);

  return filteredRecipes.sort((a, b) => b.matchScore - a.matchScore);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, ingredients, instructions, image_url')
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
    .select('*, ingredients, instructions, image_url')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }

  return data || [];
}
