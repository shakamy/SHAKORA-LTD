
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let allProjects=[];
function renderProjects(filter='all'){const grid=document.querySelector('[data-projects]');if(!grid)return;const rows=filter==='all'?allProjects:allProjects.filter(p=>(p.categories?.name||'')===filter);grid.innerHTML=rows.length?rows.map(p=>`<a class="project-card" href="project.html?slug=${encodeURIComponent(p.slug)}"><div class="project-image">${p.cover_url?`<img src="${escapeHtml(p.cover_url)}" alt="${escapeHtml(p.cover_alt||p.title)}" loading="lazy">`:''}</div><div class="project-meta"><span>${escapeHtml(p.categories?.name||'Project')}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.short_description||'')}</p></div></a>`).join(''):'<p class="muted">No projects in this category yet.</p>'}
async function loadProjects(){const {data}=await shaksSupabase.from('projects').select('id,title,slug,short_description,cover_url,cover_alt,featured,year,categories(name)').eq('status','published').order('sort_order').order('published_at',{ascending:false});allProjects=data||[];renderProjects();document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active-filter'));b.classList.add('active-filter');renderProjects(b.dataset.filter)})}
async function loadGlobalSettings(){
 const {data:s}=await shaksSupabase.from('website_settings').select('*').eq('id',1).maybeSingle();
 if(!s)return;
 document.querySelectorAll('[data-site-name]').forEach(e=>e.textContent=s.studio_name||'SHAKS');
 document.querySelectorAll('[data-site-tagline]').forEach(e=>e.textContent=s.tagline||'Creative & Digital Studio');
 document.querySelectorAll('[data-site-description]').forEach(e=>e.textContent=s.short_description||'');
 document.querySelectorAll('[data-site-email]').forEach(e=>e.textContent=s.email||'');
 const links={instagram:s.instagram,facebook:s.facebook,linkedin:s.linkedin,behance:s.behance,tiktok:s.tiktok,youtube:s.youtube,x:s.x_url};
 Object.entries(links).forEach(([k,v])=>document.querySelectorAll(`[data-social="${k}"]`).forEach(a=>{if(v){a.href=v;a.hidden=false}else a.hidden=true}));
 if(s.favicon_url){let f=document.querySelector('link[rel="icon"]');if(!f){f=document.createElement('link');f.rel='icon';document.head.appendChild(f)}f.href=s.favicon_url}
}
async function loadTestimonials(){
 const el=document.querySelector('[data-testimonials]');if(!el)return;
 const {data}=await shaksSupabase.from('testimonials').select('*').eq('published',true).order('sort_order');
 el.innerHTML=(data||[]).map(t=>`<article class="cms-card"><p>“${escapeHtml(t.testimonial)}”</p><strong>${escapeHtml(t.client_name)}</strong><div class="help">${escapeHtml(t.company||'')} ${escapeHtml(t.role||'')}</div></article>`).join('');
}
document.addEventListener('shaks:supabase-ready',()=>{loadProjects();loadGlobalSettings();loadTestimonials()});
