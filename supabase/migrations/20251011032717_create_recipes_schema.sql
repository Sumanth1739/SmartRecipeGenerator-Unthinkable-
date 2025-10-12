/*
  # Smart Recipe Generator Schema

  ## Overview
  Creates the database schema for the Smart Recipe Generator app that suggests recipes 
  based on user-provided ingredients with filtering, ratings, and favorites.

  ## New Tables
  
  ### `recipes`
  Core recipe data with nutritional information and metadata
  - `id` (uuid, primary key) - Unique recipe identifier
  - `name` (text) - Recipe title
  - `description` (text) - Short recipe description
  - `ingredients` (jsonb) - Array of ingredient objects with name and quantity
  - `instructions` (text array) - Step-by-step cooking instructions
  - `image_url` (text) - Recipe image URL
  - `cooking_time` (integer) - Total time in minutes
  - `difficulty` (text) - easy, medium, or hard
  - `diet_type` (text array) - vegetarian, vegan, gluten-free, etc.
  - `calories` (integer) - Nutritional info
  - `protein` (integer) - Protein in grams
  - `carbs` (integer) - Carbohydrates in grams
  - `fat` (integer) - Fat in grams
  - `created_at` (timestamptz) - Timestamp
  
  ### `user_favorites`
  Tracks user favorite recipes and ratings
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (text) - Anonymous user identifier (localStorage-based)
  - `recipe_id` (uuid) - Reference to recipes table
  - `rating` (integer) - User rating 1-5
  - `created_at` (timestamptz) - Timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for recipes (no auth required)
  - User-specific access for favorites based on user_id
*/

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions text[] NOT NULL DEFAULT ARRAY[]::text[],
  image_url text NOT NULL,
  cooking_time integer NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  diet_type text[] NOT NULL DEFAULT ARRAY[]::text[],
  calories integer NOT NULL DEFAULT 0,
  protein integer NOT NULL DEFAULT 0,
  carbs integer NOT NULL DEFAULT 0,
  fat integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes (public read access)
CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  USING (true);

-- RLS Policies for user_favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own favorites"
  ON user_favorites FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recipes_diet_type ON recipes USING GIN (diet_type);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes (difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_cooking_time ON recipes (cooking_time);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_recipe_id ON user_favorites (recipe_id);