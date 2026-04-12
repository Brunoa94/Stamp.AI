-- Migration: Enable Realtime for profiles table
-- Description: Adds profiles table to supabase_realtime publication for live coin updates

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
