/*
  # Update Authentication Policies for Smart Recipe Generator

  ## Overview
  Updates RLS policies to support both authenticated and anonymous users
  for backward compatibility while enabling proper user authentication.

  ## Changes
  
  ### Updated Policies for `user_favorites`
  - Support authenticated users (auth.uid())
  - Maintain backward compatibility for anonymous users
  - Proper user isolation for favorites and ratings
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can update own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorites;

-- Create new policies that support both authenticated and anonymous users

-- View favorites: authenticated users see their own, anonymous users see theirs
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()::text) OR
    (auth.uid() IS NULL AND user_id LIKE 'anonymous_%')
  );

-- Insert favorites: both authenticated and anonymous users can insert
CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()::text) OR
    (auth.uid() IS NULL AND user_id LIKE 'anonymous_%')
  );

-- Update favorites: both authenticated and anonymous users can update their own
CREATE POLICY "Users can update own favorites"
  ON user_favorites FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()::text) OR
    (auth.uid() IS NULL AND user_id LIKE 'anonymous_%')
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()::text) OR
    (auth.uid() IS NULL AND user_id LIKE 'anonymous_%')
  );

-- Delete favorites: both authenticated and anonymous users can delete their own
CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()::text) OR
    (auth.uid() IS NULL AND user_id LIKE 'anonymous_%')
  );

-- Add comment explaining the policy logic
COMMENT ON POLICY "Users can view own favorites" ON user_favorites IS 
'Allows authenticated users to see their own favorites (user_id = auth.uid()) and anonymous users to see theirs (user_id starts with "anonymous_")';

COMMENT ON POLICY "Users can insert own favorites" ON user_favorites IS 
'Allows authenticated users to insert favorites with their user ID and anonymous users to insert with anonymous IDs';

COMMENT ON POLICY "Users can update own favorites" ON user_favorites IS 
'Allows both authenticated and anonymous users to update their own favorites only';

COMMENT ON POLICY "Users can delete own favorites" ON user_favorites IS 
'Allows both authenticated and anonymous users to delete their own favorites only';
