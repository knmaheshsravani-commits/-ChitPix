<div className="mt-4">
  <div className="flex items-center my-4">
    <div className="flex-1 h-px bg-zinc-700"></div>
    <span className="px-3 text-zinc-500 text-sm">OR</span>
    <div className="flex-1 h-px bg-zinc-700"></div>
  </div>

  <button
    onClick={async () => {
      // Supabase Google Login
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
    }}
    className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
  >
    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
    Continue with Gmail
  </button>
</div>
