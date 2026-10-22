import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env missing - Check Vercel Env Variables!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// R2 + Supabase Combo - ChitPix A to Z
// R2 = Posts 300MB Original Quality (Cloudflare)
// Supabase = comments, comment_likes, post_likes - Lifetime!
