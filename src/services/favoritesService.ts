import { supabase } from '../lib/supabase';

const USER_ID_KEY = 'recipe_app_user_id';

function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export async function getFavorites() {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch favorites: ${error.message}`);
  }

  return data || [];
}

export async function isFavorite(recipeId: string): Promise<boolean> {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  if (error) {
    console.error('Error checking favorite:', error);
    return false;
  }

  return !!data;
}

export async function addFavorite(recipeId: string, rating?: number) {
  const userId = getUserId();
  const { error } = await supabase
    .from('user_favorites')
    .insert({
      user_id: userId,
      recipe_id: recipeId,
      rating: rating || null
    });

  if (error) {
    throw new Error(`Failed to add favorite: ${error.message}`);
  }
}

export async function removeFavorite(recipeId: string) {
  const userId = getUserId();
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId);

  if (error) {
    throw new Error(`Failed to remove favorite: ${error.message}`);
  }
}

export async function updateRating(recipeId: string, rating: number) {
  const userId = getUserId();
  const { error } = await supabase
    .from('user_favorites')
    .update({ rating })
    .eq('user_id', userId)
    .eq('recipe_id', recipeId);

  if (error) {
    throw new Error(`Failed to update rating: ${error.message}`);
  }
}

export async function getRating(recipeId: string): Promise<number | null> {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('user_favorites')
    .select('rating')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  if (error) {
    console.error('Error getting rating:', error);
    return null;
  }

  return data?.rating || null;
}
