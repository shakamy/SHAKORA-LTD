const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function loadServices(){
  const el=document.querySelector('[data-services]');
  if(!el)return;
  const {data,error}=await shaksSupabase.from('services').select('*').eq('active',true).order('sort_order');
  if(error){el.innerHTML=`<p class="muted">Unable to load services right now.</p>`;return}
  if(!data||!data.length){el.innerHTML=`<p class="muted">Services coming soon.</p>`;return}
  el.innerHTML=data.map(s=>`<article class="service"><h3>${escapeHtml(s.name)}</h3><p class="muted">${escapeHtml(s.short_description||'')}</p></article>`).join('');
}

document.addEventListener('shaks:supabase-ready',loadServices);
