# Database Setup Instructions

## Overview

Your app now stores uploaded pictures and their metadata in a Supabase database table instead of browser local storage.

## What Was Implemented

### 1. Database Schema (`supabase-schema.sql`)
Created a `memories` table with the following structure:
- `id` (UUID) - Auto-generated primary key
- `created_at` (Timestamp) - Automatically set on creation
- `title` (Text) - Memory title
- `description` (Text) - Memory notes/description
- `image_url` (Text) - URL to the stored image

The table includes Row Level Security (RLS) policies for public read/write access.

### 2. Database Helper Functions (`lib/memoryDb.ts`)
Created three helper functions:
- `fetchMemories()` - Retrieves all memories from database
- `insertMemory()` - Saves a new memory to database
- `deleteMemory()` - Removes a memory from database

### 3. Updated Memory Store (`store/memoryStore.ts`)
- Removed local storage persistence (no more `persist` middleware)
- Added `loadMemories()` function to fetch from database
- Updated `addMemory()` to save to database asynchronously
- Updated `removeMemory()` to delete from database asynchronously

### 4. Updated Upload Flow (`app/page.tsx`)
- Modified upload handler to save memories to database
- Added automatic database loading on component mount

## Setup Instructions

### Step 1: Create the Database Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Open the `supabase-schema.sql` file in this project
5. Copy all the SQL code
6. Paste it into the SQL Editor
7. Click **Run** to execute the SQL

This will create:
- The `memories` table
- Row Level Security policies
- An index for efficient querying

### Step 2: Verify Your Supabase Configuration

Ensure you have the following environment variables set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These should already be configured in your `.env.local` file.

### Step 3: Test the Implementation

1. Start your development server: `npm run dev`
2. Upload a photo
3. Verify it appears in the app
4. Check your Supabase dashboard → Table Editor → `memories` to see the stored data
5. Refresh the page - memories should persist

## Database Structure

```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL
);
```

## Key Changes

### Before (Local Storage)
- Memories stored in browser's localStorage
- Lost when clearing browser data
- Limited to ~5-10MB storage
- No cross-device sync

### After (Database)
- Memories stored in Supabase PostgreSQL database
- Persistent and reliable
- Unlimited storage (within your Supabase plan)
- Can be accessed from any device
- Ready for multi-user support in the future

## Notes

- Images are still stored in Supabase Storage (bucket: `images`)
- The database only stores the URL to the image, not the image itself
- All database operations are asynchronous
- Error handling is included for all database operations
- The table has public read/write access - you may want to add authentication later

## Future Enhancements

Consider adding:
- User authentication and user-specific memories
- Image deletion from storage when memory is deleted
- Pagination for large numbers of memories
- Search and filter functionality
- Tags or categories for memories

