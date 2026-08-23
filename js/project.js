const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

document.addEventListener('shaks:supabase-ready',async()=>{
  const slug=new URLSearchParams(location.search).get('slug');
  const el=document.querySelector('#project-detail');
  if(!slug){el.innerHTML='<h1>Project not found.</h1>';return}
  const {data:p,error}=await shaksSupabase.from('projects').select('*,categories(name)').eq('slug',slug).eq('status','published').single();
  if(error||!p){el.innerHTML='<h1>Project not found.</h1>';return}

  document.title=p.title+' — SHAKS';
  const desc=p.short_description||'';
  const setMeta=(sel,attr,val)=>{const m=document.querySelector(sel);if(m)m.setAttribute(attr,val)};
  setMeta('meta[name="description"]','content',desc);
  setMeta('meta[property="og:title"]','content',p.title+' — SHAKS');
  setMeta('meta[property="og:description"]','content',desc);
  if(p.cover_url)setMeta('meta[property="og:image"]','content',p.cover_url);
  setMeta('meta[name="twitter:title"]','content',p.title+' — SHAKS');
  setMeta('meta[name="twitter:description"]','content',desc);

  el.innerHTML=`<div class="eyebrow">${escapeHtml(p.categories?.name||'Project')}</div><h1>${escapeHtml(p.title)}</h1><p class="muted">${escapeHtml(desc)}</p>${p.cover_url?`<div class="case-cover"><img src="${escapeHtml(p.cover_url)}" alt="${escapeHtml(p.cover_alt||p.title)}"></div>`:''}<div class="case-grid"><aside class="muted">Client: ${escapeHtml(p.client||'—')}<br>Year: ${escapeHtml(p.year||'—')}</aside><article class="case-body">${p.overview?`<h2>Overview</h2><p>${escapeHtml(p.overview)}</p>`:''}${p.challenge?`<h2>Challenge</h2><p>${escapeHtml(p.challenge)}</p>`:''}${p.approach?`<h2>Approach</h2><p>${escapeHtml(p.approach)}</p>`:''}${p.solution?`<h2>Solution</h2><p>${escapeHtml(p.solution)}</p>`:''}${p.results?`<h2>Results</h2><p>${escapeHtml(p.results)}</p>`:''}${p.live_url?`<p><a class="btn primary" href="${escapeHtml(p.live_url)}" target="_blank" rel="noopener">Visit project</a></p>`:''}</article></div>`;
});
