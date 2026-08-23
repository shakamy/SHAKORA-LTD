const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

document.addEventListener('shaks:supabase-ready',async()=>{
  const slug=new URLSearchParams(location.search).get('slug');
  const el=document.querySelector('#post-detail');
  if(!slug){el.innerHTML='<h1>Post not found.</h1>';return}
  const {data:p,error}=await shaksSupabase.from('posts').select('*').eq('slug',slug).eq('status','published').single();
  if(error||!p){el.innerHTML='<h1>Post not found.</h1>';return}

  const title=p.seo_title||p.title;
  const desc=p.meta_description||p.excerpt||'';
  document.title=title+' — SHAKS';
  const setMeta=(sel,attr,val)=>{const m=document.querySelector(sel);if(m)m.setAttribute(attr,val)};
  setMeta('meta[name="description"]','content',desc);
  setMeta('meta[property="og:title"]','content',title+' — SHAKS');
  setMeta('meta[property="og:description"]','content',desc);
  if(p.og_image_url||p.cover_url)setMeta('meta[property="og:image"]','content',p.og_image_url||p.cover_url);
  setMeta('meta[name="twitter:title"]','content',title+' — SHAKS');
  setMeta('meta[name="twitter:description"]','content',desc);

  const date=p.published_at?new Date(p.published_at).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}):'';
  el.innerHTML=`<div class="eyebrow">${escapeHtml(p.category||'Insight')}</div><h1>${escapeHtml(p.title)}</h1><p class="muted">${[p.author_name,date].filter(Boolean).map(escapeHtml).join(' · ')}</p>${p.cover_url?`<div class="case-cover"><img src="${escapeHtml(p.cover_url)}" alt="${escapeHtml(p.cover_alt||p.title)}"></div>`:''}<article class="case-body">${(p.content||'').split(/\n{2,}/).filter(Boolean).map(para=>`<p>${escapeHtml(para)}</p>`).join('')}</article>`;
});
