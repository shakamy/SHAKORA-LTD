document.addEventListener('shaks:supabase-ready',()=>{
  const form=document.querySelector('#contact-form');
  if(!form)return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const {error}=await shaksSupabase.from('contact_messages').insert({name:f.get('name'),email:f.get('email'),company:f.get('company'),service:f.get('service'),message:f.get('message')});
    document.querySelector('#form-status').textContent=error?error.message:'Thanks — your enquiry has been received.';
    if(!error)e.currentTarget.reset();
  });
});
