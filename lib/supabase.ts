import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env missing - Check Vercel Env Variables!")
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// --- CHITPIX A TO Z SETUP ---
// R2 = Posts 300MB Original Quality (Cloudflare) - /lib/r2.js lo
// Supabase = profiles, posts, comments, likes - Lifetime!

// Helper - Gmail to username (knmaheshsravani@gmail.com -> knmaheshsravani)
export const getUsernameFromEmail = (email) => {
  return email.split('@')[0].toLowerCase()
}

// Helper - Get My ID Filter (Main bug fix!)
export const getMyUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user // user.id tho filter cheyali prathi chota!
}
