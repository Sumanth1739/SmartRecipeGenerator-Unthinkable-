import { createClient } from '@supabase/supabase-js';
console.log('import.meta.env:', import.meta.env);
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Recipe = {
  id: string;
  name: string;
  description: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
  image_url: string;
  cooking_time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  diet_type: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
};

export type UserFavorite = {
  id: string;
  user_id: string;
  recipe_id: string;
  rating: number | null;
  created_at: string;
};
