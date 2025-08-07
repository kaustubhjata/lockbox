-- Enable pgcrypto extension for AES encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop the old insecure functions
DROP FUNCTION IF EXISTS public.encrypt_folder_data(text, text);
DROP FUNCTION IF EXISTS public.decrypt_folder_data(text, text);

-- Create secure AES-256 encryption function
CREATE OR REPLACE FUNCTION public.encrypt_file_data(data bytea, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  encrypted_data bytea;
  key_hash bytea;
BEGIN
  -- Create a 256-bit key from the provided key using SHA-256
  key_hash := digest(encryption_key, 'sha256');
  
  -- Encrypt using AES-256 in CBC mode
  encrypted_data := encrypt(data, key_hash, 'aes-cbc');
  
  -- Return as base64 encoded string
  RETURN encode(encrypted_data, 'base64');
END;
$function$;

-- Create secure AES-256 decryption function
CREATE OR REPLACE FUNCTION public.decrypt_file_data(encrypted_data text, encryption_key text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  encrypted_bytes bytea;
  key_hash bytea;
  decrypted_data bytea;
BEGIN
  -- Decode the base64 encrypted data
  encrypted_bytes := decode(encrypted_data, 'base64');
  
  -- Create a 256-bit key from the provided key using SHA-256
  key_hash := digest(encryption_key, 'sha256');
  
  -- Decrypt using AES-256 in CBC mode
  decrypted_data := decrypt(encrypted_bytes, key_hash, 'aes-cbc');
  
  RETURN decrypted_data;
EXCEPTION
  WHEN OTHERS THEN
    -- Return NULL if decryption fails (wrong key/corrupted data)
    RETURN NULL;
END;
$function$;

-- Create function to encrypt folder passwords using AES-256
CREATE OR REPLACE FUNCTION public.encrypt_folder_password(password text, salt text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  key_hash bytea;
  encrypted_password bytea;
BEGIN
  -- Create encryption key from salt
  key_hash := digest(salt || 'folder_encryption_key', 'sha256');
  
  -- Encrypt password using AES-256
  encrypted_password := encrypt(password::bytea, key_hash, 'aes-cbc');
  
  -- Return as base64
  RETURN encode(encrypted_password, 'base64');
END;
$function$;

-- Create function to decrypt folder passwords
CREATE OR REPLACE FUNCTION public.decrypt_folder_password(encrypted_password text, salt text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  key_hash bytea;
  decrypted_password bytea;
  encrypted_bytes bytea;
BEGIN
  -- Decode base64
  encrypted_bytes := decode(encrypted_password, 'base64');
  
  -- Create decryption key from salt
  key_hash := digest(salt || 'folder_encryption_key', 'sha256');
  
  -- Decrypt using AES-256
  decrypted_password := decrypt(encrypted_bytes, key_hash, 'aes-cbc');
  
  -- Convert back to text
  RETURN convert_from(decrypted_password, 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$function$;

-- Add column to store encrypted file data (optional, for files that need encryption)
ALTER TABLE files ADD COLUMN IF NOT EXISTS encrypted_data text;
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_encrypted boolean DEFAULT false;