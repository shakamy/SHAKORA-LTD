
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
async function requireAdmin(){const {data}=await shaksSupabase.auth.getSession();if(!data.session){location.href='index.html';return null}return data.session}
async function logout(){await shaksSupabase.auth.signOut();location.href='index.html'}
async function login(e){e.preventDefault();const {error}=await shaksSupabase.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});if(error){$('#error').textContent=error.message;return}location.href='dashboard.html'}

async function dashboard(){if(!await requireAdmin())return;for(const t of ['projects','services','posts','contact_messages','media','categories','testimonials']){const {count}=await shaksSupabase.from(t).select('*',{count:'exact',head:true});const el=document.querySelector(`[data-count="${t}"]`);if(el)el.textContent=count??0}}

async function projectList(){
 if(!await requireAdmin())return;
 const {data,error}=await shaksSupabase.from('projects').select('id,title,slug,status,featured,year,updated_at,categories(name)').order('updated_at',{ascending:false});
 const el=$('[data-project-table]');if(error){el.innerHTML=`<p class="danger">${esc(error.message)}</p>`;return}
 el.innerHTML=`<div class="table-wrap"><table class="cms-table"><thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead><tbody>${(data||[]).map(p=>`<tr><td><strong>${esc(p.title)}</strong><br><span class="help">${esc(p.slug)}</span></td><td>${esc(p.categories?.name||'—')}</td><td><span class="badge">${esc(p.status)}</span></td><td>${p.featured?'Yes':'No'}</td><td><a class="btn" href="project-edit.html?id=${p.id}">Edit</a> <button class="btn" data-delete-project="${p.id}">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
 el.querySelectorAll('[data-delete-project]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete project?'))return;const r=await shaksSupabase.from('projects').delete().eq('id',b.dataset.deleteProject);if(r.error)alert(r.error.message);else projectList()});
}
function projectPayload(f){return{title:f.get('title').trim(),slug:f.get('slug').trim(),short_description:f.get('short_description')||null,client:f.get('client')||null,industry:f.get('industry')||null,year:f.get('year')?Number(f.get('year')):null,overview:f.get('overview')||null,challenge:f.get('challenge')||null,approach:f.get('approach')||null,solution:f.get('solution')||null,results:f.get('results')||null,live_url:f.get('live_url')||null,cover_url:f.get('cover_url')||null,cover_alt:f.get('cover_alt')||null,status:f.get('status'),featured:f.get('featured')==='on',updated_at:new Date().toISOString()}}
async function fillProject(id){
 const {data,error}=await shaksSupabase.from('projects').select('*').eq('id',id).single();if(error||!data){$('#save-status').textContent=error?.message||'Project not found.';return}
 for(const k of ['title','slug','short_description','client','industry','year','overview','challenge','approach','solution','results','live_url','cover_url','cover_alt','status']){const el=document.querySelector(`[name="${k}"]`);if(el)el.value=data[k]??''}
 const f=$('[name="featured"]');if(f)f.checked=!!data.featured;
 await loadProjectGallery(id);
}
async function saveProject(e){
 e.preventDefault();if(!await requireAdmin())return;
 const f=new FormData(e.currentTarget),id=new URLSearchParams(location.search).get('id');
 const r=id?await shaksSupabase.from('projects').update(projectPayload(f)).eq('id',id):await shaksSupabase.from('projects').insert(projectPayload(f));
 const st=$('#save-status');st.textContent=r.error?r.error.message:(id?'Project updated.':'Project created.');st.className=r.error?'danger':'success';if(!r.error&&!id)e.currentTarget.reset();
}
async function loadProjectGallery(projectId){
 const {data,error}=await shaksSupabase.from('project_media').select('media_id,sort_order,media(*)').eq('project_id',projectId).order('sort_order');
 const el=$('[data-project-gallery]');if(!el)return;if(error){el.innerHTML=`<p class="danger">${esc(error.message)}</p>`;return}
 el.innerHTML=(data||[]).map(x=>`<div class="cms-card"><img class="thumb" src="${esc(x.media?.public_url||'')}" alt="${esc(x.media?.alt_text||'')}"><p>${esc(x.media?.file_name||'')}</p><button class="btn" data-gallery-remove="${x.media_id}">Remove</button></div>`).join('');
 el.querySelectorAll('[data-gallery-remove]').forEach(b=>b.onclick=async()=>{const r=await shaksSupabase.from('project_media').delete().eq('project_id',projectId).eq('media_id',b.dataset.galleryRemove);if(r.error)alert(r.error.message);else loadProjectGallery(projectId)});
}
async function addGalleryMedia(e){
 e.preventDefault();if(!await requireAdmin())return;
 const id=new URLSearchParams(location.search).get('id'),mediaId=$('#gallery-media').value;
 if(!id||!mediaId)return;
 const {data}=await shaksSupabase.from('project_media').select('sort_order').eq('project_id',id).order('sort_order',{ascending:false}).limit(1);
 const order=(data?.[0]?.sort_order??-1)+1;
 const r=await shaksSupabase.from('project_media').insert({project_id:id,media_id:mediaId,sort_order:order});
 if(r.error)alert(r.error.message);else loadProjectGallery(id);
}
async function fillGalleryOptions(){
 const {data}=await shaksSupabase.from('media').select('id,file_name').order('created_at',{ascending:false});
 const el=$('#gallery-media');if(el)el.innerHTML='<option value="">Select media…</option>'+(data||[]).map(m=>`<option value="${m.id}">${esc(m.file_name)}</option>`).join('');
}

async function categoryManager(){if(!await requireAdmin())return;const {data,error}=await shaksSupabase.from('categories').select('*').order('sort_order');const el=$('[data-category-list]');if(error){el.innerHTML=`<p class="danger">${esc(error.message)}</p>`;return}el.innerHTML=(data||[]).map(c=>`<div class="cms-card"><strong>${esc(c.name)}</strong><p class="help">${esc(c.slug)}</p><button class="btn" data-cat-delete="${c.id}">Delete</button></div>`).join('');el.querySelectorAll('[data-cat-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete category?'))return;const r=await shaksSupabase.from('categories').delete().eq('id',b.dataset.catDelete);if(r.error)alert(r.error.message);else categoryManager()})}
async function saveCategory(e){e.preventDefault();if(!await requireAdmin())return;const f=new FormData(e.currentTarget);const r=await shaksSupabase.from('categories').insert({name:f.get('name').trim(),slug:f.get('slug').trim(),description:f.get('description')||null});$('#category-status').textContent=r.error?r.error.message:'Category created.';$('#category-status').className=r.error?'danger':'success';if(!r.error){e.currentTarget.reset();categoryManager()}}

async function serviceManager(){if(!await requireAdmin())return;const {data,error}=await shaksSupabase.from('services').select('*').order('sort_order');const el=$('[data-service-list]');if(error){el.innerHTML=`<p class="danger">${esc(error.message)}</p>`;return}el.innerHTML=(data||[]).map(s=>`<div class="cms-card"><strong>${esc(s.name)}</strong><p class="help">${esc(s.short_description||'')}</p><button class="btn" data-service-delete="${s.id}">Delete</button></div>`).join('');el.querySelectorAll('[data-service-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete service?'))return;const r=await shaksSupabase.from('services').delete().eq('id',b.dataset.serviceDelete);if(r.error)alert(r.error.message);else serviceManager()})}
async function saveService(e){e.preventDefault();if(!await requireAdmin())return;const f=new FormData(e.currentTarget);const r=await shaksSupabase.from('services').insert({name:f.get('name').trim(),slug:f.get('slug').trim(),short_description:f.get('short_description')||null,full_description:f.get('full_description')||null});$('#service-status').textContent=r.error?r.error.message:'Service created.';$('#service-status').className=r.error?'danger':'success';if(!r.error){e.currentTarget.reset();serviceManager()}}

async function testimonialManager(){
 if(!await requireAdmin())return;
 const {data,error}=await shaksSupabase.from('testimonials').select('*').order('sort_order');
 const el=$('[data-testimonial-list]');if(error){el.innerHTML=`<p class="danger">${esc(error.message)}</p>`;return}
 el.innerHTML=(data||[]).map(t=>`<div class="cms-card"><strong>${esc(t.client_name)}</strong><p class="help">${esc(t.company||'')} ${esc(t.role||'')}</p><p>${esc(t.testimonial)}</p><button class="btn" data-testimonial-delete="${t.id}">Delete</button></div>`).join('');
 el.querySelectorAll('[data-testimonial-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete testimonial?'))return;const r=await shaksSupabase.from('testimonials').delete().eq('id',b.dataset.testimonialDelete);if(r.error)alert(r.error.message);else testimonialManager()});
}
async function saveTestimonial(e){
 e.preventDefault();if(!await requireAdmin())return;const f=new FormData(e.currentTarget);
 const r=await shaksSupabase.from('testimonials').insert({client_name:f.get('client_name').trim(),company:f.get('company')||null,role:f.get('role')||null,testimonial:f.get('testimonial').trim(),client_image_url:f.get('client_image_url')||null,company_logo_url:f.get('company_logo_url')||null,featured:f.get('featured')==='on'});
 $('#testimonial-status').textContent=r.error?r.error.message:'Testimonial added.';$('#testimonial-status').className=r.error?'danger':'success';if(!r.error){e.currentTarget.reset();testimonialManager()}
}

const settingsFields=['studio_name','tagline','short_description','logo_url','light_logo_url','dark_logo_url','favicon_url','email','phone','whatsapp','location','instagram','facebook','linkedin','behance','tiktok','youtube','x_url','footer_description','copyright_text'];
async function settings(){if(!await requireAdmin())return;const {data}=await shaksSupabase.from('website_settings').select('*').eq('id',1).maybeSingle();if(data)settingsFields.forEach(k=>{const el=document.querySelector(`[name="${k}"]`);if(el)el.value=data[k]??''});const {data:seo}=await shaksSupabase.from('seo_settings').select('*').eq('id',1).maybeSingle();if(seo)['site_title','site_description','default_og_image','twitter_card'].forEach(k=>{const el=document.querySelector(`[name="seo_${k}"]`);if(el)el.value=seo[k]??''})}
async function saveSettings(e){e.preventDefault();if(!await requireAdmin())return;const f=new FormData(e.currentTarget),payload={id:1};settingsFields.forEach(k=>payload[k]=f.get(k)||null);let r=await shaksSupabase.from('website_settings').upsert(payload,{onConflict:'id'});if(!r.error)r=await shaksSupabase.from('seo_settings').upsert({id:1,site_title:f.get('seo_site_title')||null,site_description:f.get('seo_site_description')||null,default_og_image:f.get('seo_default_og_image')||null,twitter_card:f.get('seo_twitter_card')||'summary_large_image'},{onConflict:'id'});const st=$('#settings-status');st.textContent=r.error?r.error.message:'Settings saved.';st.className=r.error?'danger':'success'}

async function media(){
 if(!await requireAdmin())return;
 const {data,error}=await shaksSupabase.from('media').select('*').order('created_at',{ascending:false});
 const el=$('[data-media-grid]');if(error){el.innerHTML=`<p class="danger">${esc(error.message)}</p>`;return}
 el.innerHTML=(data||[]).map(m=>`<article class="media-card"><img src="${esc(m.public_url||'')}" alt="${esc(m.alt_text||m.file_name)}"><div class="media-body"><strong>${esc(m.file_name)}</strong><p class="help">${esc(m.alt_text||'No alt text')}</p><button class="btn" data-media-edit="${m.id}">Edit metadata</button> <button class="btn" data-media-delete="${m.id}" data-path="${esc(m.storage_path)}">Delete</button></div></article>`).join('');
 el.querySelectorAll('[data-media-edit]').forEach(b=>b.onclick=()=>openMediaEditor(b.dataset.mediaEdit));
 el.querySelectorAll('[data-media-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete media?'))return;const ref=await shaksSupabase.from('project_media').select('project_id').eq('media_id',b.dataset.mediaDelete);if(ref.data?.length){alert('This media is linked to a project and cannot be deleted. Remove it from the project first.');return}const st=await shaksSupabase.storage.from('portfolio-media').remove([b.dataset.path]);if(st.error){alert(st.error.message);return}const r=await shaksSupabase.from('media').delete().eq('id',b.dataset.mediaDelete);if(r.error)alert(r.error.message);else media()});
}
async function openMediaEditor(id){
 const {data,error}=await shaksSupabase.from('media').select('*').eq('id',id).single();if(error){alert(error.message);return}
 const title=prompt('Media title:',data.title||'');if(title===null)return;
 const alt=prompt('Alt text:',data.alt_text||'');if(alt===null)return;
 const desc=prompt('Description:',data.description||'');if(desc===null)return;
 const r=await shaksSupabase.from('media').update({title,alt_text:alt,description:desc}).eq('id',id);if(r.error)alert(r.error.message);else media();
}
async function uploadMedia(e){e.preventDefault();if(!await requireAdmin())return;const file=$('#media-file').files[0];if(!file)return;if(!file.type.startsWith('image/')){$('#media-status').textContent='Only image files are allowed.';return}const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-'),path=`general/${Date.now()}-${safe}`;let r=await shaksSupabase.storage.from('portfolio-media').upload(path,file,{upsert:false});if(r.error){$('#media-status').textContent=r.error.message;return}const {data:u}=shaksSupabase.storage.from('portfolio-media').getPublicUrl(path);r=await shaksSupabase.from('media').insert({storage_path:path,public_url:u.publicUrl,file_name:file.name,mime_type:file.type,file_size:file.size,alt_text:file.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ')});$('#media-status').textContent=r.error?r.error.message:'Media uploaded.';if(!r.error){e.currentTarget.reset();media()}}

async function messages(){if(!await requireAdmin())return;const {data,error}=await shaksSupabase.from('contact_messages').select('*').order('created_at',{ascending:false});const el=$('[data-message-table]');if(error){el.innerHTML=`<p class="danger">${esc(error.message)}</p>`;return}el.innerHTML=`<div class="table-wrap"><table class="cms-table"><thead><tr><th>Contact</th><th>Service</th><th>Status</th><th>Date</th></tr></thead><tbody>${(data||[]).map(m=>`<tr><td><strong>${esc(m.name)}</strong><br><span class="help">${esc(m.email)}</span></td><td>${esc(m.service||'—')}</td><td><select data-message-status="${m.id}">${['new','contacted','in_discussion','won','lost','archived'].map(s=>`<option value="${s}" ${s===m.status?'selected':''}>${s}</option>`).join('')}</select></td><td>${new Date(m.created_at).toLocaleDateString()}</td></tr>`).join('')}</tbody></table></div>`;el.querySelectorAll('[data-message-status]').forEach(sel=>sel.onchange=async()=>{const r=await shaksSupabase.from('contact_messages').update({status:sel.value}).eq('id',sel.dataset.messageStatus);if(r.error)alert(r.error.message)})}

function initAdmin(){
 const lf=$('#login-form');if(lf)lf.addEventListener('submit',login);
 const p=document.body.dataset.adminPage;
 if(p==='dashboard')dashboard();
 if(p==='projects')projectList();
 if(p==='new-project')$('#project-form')?.addEventListener('submit',saveProject);
 if(p==='edit-project'){const id=new URLSearchParams(location.search).get('id');fillProject(id);fillGalleryOptions();$('#project-form')?.addEventListener('submit',saveProject);$('#gallery-form')?.addEventListener('submit',addGalleryMedia)}
 if(p==='categories'){categoryManager();$('#category-form')?.addEventListener('submit',saveCategory)}
 if(p==='services'){serviceManager();$('#service-form')?.addEventListener('submit',saveService)}
 if(p==='testimonials'){testimonialManager();$('#testimonial-form')?.addEventListener('submit',saveTestimonial)}
 if(p==='messages')messages();
 if(p==='settings'){settings();$('#settings-form')?.addEventListener('submit',saveSettings)}
 if(p==='media'){media();$('#media-form')?.addEventListener('submit',uploadMedia)}
 document.querySelectorAll('[data-logout]').forEach(b=>b.onclick=logout);
}

// supabase-client.js can finish before this deferred script registers its event listener.
// Initialize immediately when the client is already available; otherwise wait for the event.
if(window.shaksSupabase) initAdmin();
else document.addEventListener('shaks:supabase-ready',initAdmin,{once:true});
