-- Run these SQL statements in your Supabase SQL Editor
-- This will set up the 'vault' table and Row Level Security for Vaulty 

CREATE TABLE IF NOT EXISTS public.vault (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    site_name TEXT NOT NULL,
    username TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    encrypted_password JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.vault ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only view and edit their own data
CREATE POLICY "Users can view their own vault items"
    ON public.vault FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault items"
    ON public.vault FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault items"
    ON public.vault FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault items"
    ON public.vault FOR DELETE
    USING (auth.uid() = user_id);
