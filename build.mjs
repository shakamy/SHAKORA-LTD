import fs from "fs";

const url=process.env.SHAKS_SUPABASE_URL || "";
const key=process.env.SHAKS_SUPABASE_ANON_KEY || "";
const config=`window.SHAKS_SUPABASE_URL=${JSON.stringify(url)};\nwindow.SHAKS_SUPABASE_ANON_KEY=${JSON.stringify(key)};\n`;
if(url && key){fs.writeFileSync("js/supabase-config.js",config);}
else if(!fs.existsSync("js/supabase-config.js")){fs.copyFileSync("js/supabase-config.example.js","js/supabase-config.js");}
console.log("SHAKS V1.0.0 static build complete.");
