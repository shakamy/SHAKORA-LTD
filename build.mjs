import fs from 'fs';
import path from 'path';

const root = process.cwd();
const out = path.join(root, 'dist');

const sourceEntries = [
  'index.html','about.html','work.html','services.html','contact.html',
  'project.html','insights.html','post.html',
  'admin','css','js','assets','images','fonts',
  'robots.txt','sitemap.xml','favicon.ico','site.webmanifest'
];

function copyEntry(name) {
  const src = path.join(root, name);
  if (!fs.existsSync(src)) return;
  const dest = path.join(out, name);
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.cpSync(src, dest, { recursive: true, force: true });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(out)) fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const entry of sourceEntries) copyEntry(entry);

const configDir = path.join(out, 'js');
fs.mkdirSync(configDir, { recursive: true });

const url = process.env.SHAKS_SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co';
const key = process.env.SHAKS_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY';

fs.writeFileSync(
  path.join(configDir, 'supabase-config.js'),
  `window.SHAKS_SUPABASE_URL=${JSON.stringify(url)};\nwindow.SHAKS_SUPABASE_ANON_KEY=${JSON.stringify(key)};\n`
);

console.log('SHAKS V1.0.0 static build complete.');
console.log(`Output directory: ${out}`);
