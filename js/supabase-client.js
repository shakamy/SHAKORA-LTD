(()=>{
  const boot=()=>{
    if(!window.SHAKS_SUPABASE_URL||window.SHAKS_SUPABASE_URL.includes('YOUR-PROJECT')) return;
    if(!window.supabase||typeof window.supabase.createClient!=='function'){
      console.error('SHAKS: local Supabase library failed to load.');
      return;
    }
    const isAdmin=location.pathname.includes('/admin/');
    window.shaksSupabase=window.supabase.createClient(
      window.SHAKS_SUPABASE_URL,
      window.SHAKS_SUPABASE_ANON_KEY,
      {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
    );
    window.SHAKS_SUPABASE_READY = true;
    document.dispatchEvent(new Event('shaks:supabase-ready'));
  };
  if(window.supabase) boot();
  else document.addEventListener('shaks:supabase-library-ready',boot,{once:true});
})();
