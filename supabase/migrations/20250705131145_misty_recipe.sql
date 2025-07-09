/*
  # Fix profiles table RLS policy for user registration

  1. Security Policy Updates
    - Drop the existing INSERT policy that uses `uid()` 
    - Create a new INSERT policy using `auth.uid()` for proper authentication
    - Ensure users can create their own profile during registration

  This fixes the "new row violates row-level security policy" error during user registration.
*/

-- Drop the existing INSERT policy that might be using incorrect function
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new INSERT policy with correct auth function
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);