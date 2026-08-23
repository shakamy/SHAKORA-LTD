(()=>{
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  s.onload=()=>{
    if(!window.SHAKS_SUPABASE_URL||window.SHAKS_SUPABASE_URL.includes('YOUR-PROJECT'))return;
    // Admin pages use sessionStorage so a login survives a page reload
    // but is cleared as soon as the browser/tab is closed. Public pages
    // don't authenticate, so the default (localStorage) is irrelevant there.
    const isAdmin=location.pathname.includes('/admin/');
    const options=isAdmin?{auth:{storage:window.sessionStorage,persistSession:true,autoRefreshToken:true}}:undefined;
    window.shaksSupabase=window.supabase.createClient(window.SHAKS_SUPABASE_URL,window.SHAKS_SUPABASE_ANON_KEY,options);
    document.dispatchEvent(new Event('shaks:supabase-ready'));
  };
  document.head.appendChild(s);
})();
