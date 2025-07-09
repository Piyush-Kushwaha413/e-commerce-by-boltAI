/*
  # Fix profiles table RLS policies

  1. Security Updates
    - Drop all existing policies on profiles table
    - Recreate policies with correct auth.uid() function
    - Ensure proper permissions for user registration and profile management

  2. Changes
    - Fix INSERT policy for user registration
    - Fix SELECT policy for reading own profile
    - Fix UPDATE policy for updating own profile
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create INSERT policy for user registration
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create SELECT policy for reading own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create UPDATE policy for updating own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Also ensure the profiles table has RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;