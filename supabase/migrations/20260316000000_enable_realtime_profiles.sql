-- Migration: Enable Realtime for profiles table
-- Description: Adds profiles table to supabase_realtime publication for live coin updates

-- Enable realtime for profiles table
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION WHEN OTHERS THEN
  -- Table already a member of the publication, ignore
  NULL;
END $$;
