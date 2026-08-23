const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function loadPosts(){
  const el=document.querySelector('[data-posts]');
  if(!el)return;
  const {data,error}=await shaksSupabase.from('posts').select('title,slug,excerpt,cover_url,cover_alt,category,published_at').eq('status','published').order('published_at',{ascending:false});
  if(error){el.innerHTML=`<p class="muted">Unable to load posts right now.</p>`;return}
  if(!data||!data.length){el.innerHTML=`<p class="muted">No posts published yet.</p>`;return}
  el.innerHTML=data.map(p=>`<a class="project-card" href="post.html?slug=${encodeURIComponent(p.slug)}"><div class="project-image">${p.cover_url?`<img src="${escapeHtml(p.cover_url)}" alt="${escapeHtml(p.cover_alt||p.title)}" loading="lazy">`:''}</div><div class="project-meta"><span>${escapeHtml(p.category||'Insight')}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.excerpt||'')}</p></div></a>`).join('');
}

document.addEventListener('shaks:supabase-ready',loadPosts);
