import fs from 'fs';
import path from 'path';

const root = process.cwd();
const out = path.join(root, 'dist');

const sourceEntries = [
  'index.html','about.html','work.html','services.html','contact.html',
  'project.html','insights.html','post.html','admin','css','js','assets','images','fonts',
  'robots.txt','sitemap.xml','favicon.ico','site.webmanifest','_headers'
];

function copyEntry(name) {
  const src = path.join(root, name);
  if (!fs.existsSync(src)) return;
  const dest = path.join(out, name);
  const stat = fs.statSync(src);
  if (stat.isDirectory()) fs.cpSync(src, dest, {recursive:true, force:true});
  else { fs.mkdirSync(path.dirname(dest), {recursive:true}); fs.copyFileSync(src, dest); }
}

if (fs.existsSync(out)) fs.rmSync(out, {recursive:true, force:true});
fs.mkdirSync(out, {recursive:true});
for (const entry of sourceEntries) copyEntry(entry);

const vendor = path.join(root, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js');
if (!fs.existsSync(vendor)) throw new Error('Supabase JS SDK not installed. Run npm install before building.');
const vendorOut = path.join(out, 'js/vendor/supabase.js');
fs.mkdirSync(path.dirname(vendorOut), {recursive:true});
fs.copyFileSync(vendor, vendorOut);

const configDir = path.join(out, 'js');
const url = process.env.SHAKS_SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co';
const key = process.env.SHAKS_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY';
fs.writeFileSync(path.join(configDir,'supabase-config.js'),
`window.SHAKS_SUPABASE_URL=${JSON.stringify(url)};\nwindow.SHAKS_SUPABASE_ANON_KEY=${JSON.stringify(key)};\n`);

// Inject the first-party SDK before supabase-client.js on every page that uses it.
const htmlFiles=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))htmlFiles.push(p)}}
walk(out);
for(const file of htmlFiles){
  let html=fs.readFileSync(file,'utf8');
  const prefix = file.includes(`${path.sep}admin${path.sep}`) ? '../js/' : 'js/';
  const client = `${prefix}supabase-client.js`;
  const vendorTag = `<script src="${prefix}vendor/supabase.js"`;
  if(html.includes(client) && !html.includes(vendorTag)){
    const plain = `<script src="${client}"></script>`;
    const deferred = `<script src="${client}" defer></script>`;
    if(html.includes(deferred)){
      html=html.replace(deferred, `${vendorTag} defer></script><script src="${client}" defer></script>`);
    } else if(html.includes(plain)) {
      html=html.replace(plain, `${vendorTag}></script><script src="${client}"></script>`);
    }
    fs.writeFileSync(file,html);
  }
}
console.log('SHAKS V1.0.0 static build complete.');
console.log('Output directory: dist');
