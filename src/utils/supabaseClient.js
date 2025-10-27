// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Recupera le variabili d'ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crea e esporta il client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);