-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  date DATE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" 
  ON memories 
  FOR SELECT 
  USING (true);

-- Create policy to allow public insert access
CREATE POLICY "Allow public insert access" 
  ON memories 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow public delete access
CREATE POLICY "Allow public delete access" 
  ON memories 
  FOR DELETE 
  USING (true);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS memories_created_at_idx ON memories(created_at DESC);

-- Migration: Add date column to existing table
-- Run this if you already have the table created:
-- ALTER TABLE memories ADD COLUMN IF NOT EXISTS date DATE;
-- UPDATE memories SET date = created_at::date WHERE date IS NULL;
-- ALTER TABLE memories ALTER COLUMN date SET NOT NULL;

