-- Add email column to carts table
ALTER TABLE carts
ADD COLUMN user_email TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN carts.user_email IS 'Email address of the user associated with this cart';
