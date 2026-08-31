# Full-Stack Notes App 📝

A secure, offline-first notes application with authentication, strict user data isolation via Supabase and Row Level Security (RLS), real-time synchronization, and a responsive React interface.

---

## 🌟 Features

- **Authentication & User Isolation**:
  - Secure sign up with email and password.
  - Session verification and logout.
  - Strict data isolation: Every note belongs strictly to one authenticated user (`user_id`).
  - Row Level Security (RLS) policies prevent unauthorized reads, updates, and deletes.
- **Notes Management**:
  - Create notes with rich title and formatted body.
  - Edit and delete existing notes.
  - Pin important notes to the top.
  - Color tagging / category organization.
  - Search and filter notes instantly by title and content.
  - Sort by newest created, recently updated, or title.
- **Offline Mode & Real-Time Sync Engine**:
  - Seamless offline storage using browser IndexedDB with persistent cache.
  - Optimistic updates: Changes save locally immediately.
  - Automatic synchronization queue: When connection is restored, pending changes are reconciled with the backend automatically.
  - Real-time status indicators (Online, Offline, Syncing, Up to date).
- **Security & Privacy**:
  - **Zero frontend API keys**: All Supabase interactions, credentials, and token validations occur server-side through secure Express proxy endpoints.
  - Comprehensive RLS policies in PostgreSQL.

---

## 🏛️ Clean Architecture

The codebase is organized into distinct layers adhering to Clean Architecture principles:

```
├── server.ts                    # Backend server (Express API proxy + Supabase integration)
├── supabase/
│   └── schema.sql              # Database schema & Row Level Security (RLS) policies
├── src/
│   ├── types/                  # Domain entity types (Note, User, SyncState, Actions)
│   ├── services/               # Infrastructure & Data Layer
│   │   ├── api.ts              # Server API communication client
│   │   ├── offlineStorage.ts   # IndexedDB local persistent store
│   │   └── syncManager.ts      # Offline queue & synchronization coordinator
│   ├── hooks/                  # Presentation / Controller hooks
│   │   ├── useAuth.tsx         # Auth state and actions provider
│   │   ├── useNotes.ts         # Note collection state, optimistic updates & search/sort
│   │   └── useNetworkStatus.ts # Online/Offline network connectivity listener
│   └── components/             # Presentation UI Components
│       ├── AuthView.tsx        # Sign in / Sign up form with validation
│       ├── Header.tsx          # App bar with user session, search, and status
│       ├── NoteCard.tsx        # Note item card with quick actions and badges
│       ├── NoteEditor.tsx      # Note creation and edit modal / drawer
│       ├── SearchFilterBar.tsx # Instant search, sort selector, and view modes
│       ├── SyncBadge.tsx       # Live online/offline/syncing status badge
│       └── ConfirmModal.tsx    # Accessible delete confirmation dialog
```

---

## 🗄️ Database Schema & RLS Policies

Run the following SQL in your **Supabase SQL Editor** to initialize the database:

```sql
-- 1. Create the 'notes' table
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

-- 2. Indices for query optimization
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- SELECT: Users can only read notes where user_id equals their auth UID
CREATE POLICY "Users can view their own notes"
ON public.notes FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only insert notes with their auth UID
CREATE POLICY "Users can insert their own notes"
ON public.notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own notes
CREATE POLICY "Users can update their own notes"
ON public.notes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own notes
CREATE POLICY "Users can delete their own notes"
ON public.notes FOR DELETE
USING (auth.uid() = user_id);

-- 5. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
# Server-side Supabase credentials (never exposed to browser)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # optional
JWT_SECRET=your-custom-jwt-secret
```

> **Note**: In development or demo preview, the backend includes an embedded persistent database fallback if Supabase credentials are not yet configured, allowing instant out-of-the-box testing.

---

## 🚀 Setup & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:3000`.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Start production server**:
   ```bash
   npm start
   ```

---

## 🌐 Deployment to Vercel

1. Push your repository to GitHub / GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. Set the Environment Variables in the Vercel project settings:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `JWT_SECRET`
4. Deploy! Vercel will build the frontend and serve serverless API routes or the bundled Node server.
