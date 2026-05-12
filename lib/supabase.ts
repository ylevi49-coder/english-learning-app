import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DbProgress = {
  id?: string;
  user_id: string;
  level: string;
  completed_lessons: string[];
  vocabulary_known: string[];
  vocabulary_hard: string[];
  xp: number;
  streak: number;
  last_activity: string;
};
