import { supabase } from './supabaseClient';

export interface DbMemory {
  id: string;
  created_at: string;
  title: string;
  description: string;
  image_url: string;
}

/**
 * Fetch all memories from the database, ordered by creation date (newest first)
 */
export async function fetchMemories(): Promise<DbMemory[]> {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }

  return data || [];
}

/**
 * Insert a new memory into the database
 */
export async function insertMemory(memory: {
  title: string;
  description: string;
  image_url: string;
}): Promise<DbMemory> {
  const { data, error } = await supabase
    .from('memories')
    .insert([memory])
    .select()
    .single();

  if (error) {
    console.error('Error inserting memory:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a memory from the database
 */
export async function deleteMemory(id: string): Promise<void> {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
}

