const fs=require('node:fs');const {spawnSync}=require('node:child_process');
const sources=[{"key":"heroGen","path":"C:\\Users\\arnol\\.codex\\generated_images\\01a16223-a3e1-7833-873c-2c80922f3550\\exec-c4e0c413-7599-499a-802e-a0998d64c96f.png"},{"key":"babyGen","path":"C:\\Users\\arnol\\.codex\\generated_images\\01a16223-a3e1-7833-873c-2c80922f3550\\exec-0fd01eb7-4b29-4c6c-9d05-023bd6a9f19c.png"},{"key":"girlGen","path":"C:\\Users\\arnol\\.codex\\generated_images\\01a16223-a3e1-7833-873c-2c80922f3550\\exec-7708b42c-7bb4-4069-bf48-89350bd97e7b.png"},{"key":"boyGen","path":"C:\\Users\\arnol\\.codex\\generated_images\\01a16223-a3e1-7833-873c-2c80922f3550\\exec-40c9353a-6fdd-41c2-8ade-56a90b231033.png"},{"key":"knitGen","path":"C:\\Users\\arnol\\.codex\\generated_images\\01a16223-a3e1-7833-873c-2c80922f3550\\exec-7c1765f4-2ba2-43c5-8e4f-a6a2962feacd.png"}];
fs.mkdirSync('public/images',{recursive:true});
function convert(input,output,filter){const r=spawnSync('ffmpeg',['-v','error','-y','-i',input,...(filter?['-vf',filter]:[]),'-c:v','libwebp','-quality','86',output],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}
convert(sources[0].path,'public/images/infancia-editorial.webp','scale=1536:-1');
const groups=[
 {key:'babyGen',split:.484,items:['conjunto-nube-marfil','conjunto-nube-salvia','vestido-alma-rosa','vestido-alma-marfil']},
 {key:'girlGen',split:.484,items:['vestido-flora-rosa','vestido-flora-beige','conjunto-olivia-salvia','conjunto-olivia-rosa']},
 {key:'boyGen',split:.473,items:['conjunto-leo-beige','conjunto-leo-celeste','conjunto-milo-salvia','conjunto-milo-celeste']},
 {key:'knitGen',split:.5,items:['casaca-bosque-salvia','casaca-bosque-beige','cardigan-luna-rosa','cardigan-luna-marfil']},
];
for(const group of groups)for(const [i,name]of group.items.entries()){
 const top=i<2,x=i%2?'iw/2':'0',y=top?'0':'ih*'+group.split,h=top?'ih*'+group.split:'ih*(1-'+group.split+')';
 convert(sources.find(s=>s.key===group.key).path,'public/images/'+name+'.webp',`crop=iw/2:${h}:${x}:${y}`);
}
console.log('17 fotografías WebP preparadas.');

