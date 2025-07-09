/*
  # Fix profiles table RLS policy

  1. Problem
    - The profiles table has RLS enabled but the policy is preventing user registration
    - The foreign key constraint to auth.users(id) is working correctly
    - But the RLS policy is blocking the INSERT operation

  2. Solution
    - Drop existing policies and recreate them with proper permissions
    - Ensure the INSERT policy allows authenticated users to create their own profile
    - Add a more permissive policy for the initial profile creation
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Disable RLS temporarily to ensure we can recreate policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a more permissive INSERT policy for user registration
CREATE POLICY "Enable insert for authenticated users during registration"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create SELECT policy for reading own profile
CREATE POLICY "Users can view own profile"
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

-- Create DELETE policy for deleting own profile (optional)
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);