-- ==============================================================================
-- Full-Stack Notes App: PostgreSQL + Supabase Database Schema & RLS Policies
-- ==============================================================================

-- 1. Create custom extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the 'notes' table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    color_tag TEXT DEFAULT 'default',
    tags TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create indices for high-performance querying
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);

-- 4. Enable Row Level Security (RLS) on 'notes'
-- This ensures no user can ever access or modify another user's notes, even if queried directly.
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies

-- Policy 1: SELECT - Users can only view their own notes
CREATE POLICY "Users can view their own notes"
ON public.notes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: INSERT - Users can only insert notes where user_id matches auth.uid()
CREATE POLICY "Users can insert their own notes"
ON public.notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can only update their own notes
CREATE POLICY "Users can update their own notes"
ON public.notes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE - Users can only delete their own notes
CREATE POLICY "Users can delete their own notes"
ON public.notes
FOR DELETE
USING (auth.uid() = user_id);

-- 6. Trigger to automatically update 'updated_at' column on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_notes_updated_at ON public.notes;
CREATE TRIGGER set_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- End of Supabase Schema & Security Rules
-- ==============================================================================
