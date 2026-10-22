const fs=require('node:fs');
function change(path,fn){fs.writeFileSync(path,fn(fs.readFileSync(path,'utf8')));}
const colors={'#f7f5f0':'#FAF8F5','#eeeae2':'#EDE5DA','#252822':'#343434','#555b43':'#78695F','#e9e5db':'#EDE5DA','#f0ede6':'#F2EEE8','#77796f':'#78695F','#6d705e':'#78695F','#898a80':'#78695F'};
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())walk(p);else if(/\.(css|html|ts)$/.test(p))change(p,s=>Object.entries(colors).reduce((r,[a,b])=>r.replaceAll(a,b),s));}}
walk('src');
change('src/app/app.html',s=>s
.replaceAll("genero:'mujer'","genero:'ninas'").replaceAll("genero:'hombre'","genero:'ninos'").replaceAll('>Mujer<','>Niñas<').replaceAll('>Hombre<','>Niños<')
.replace('<div class="announcement">','<a class="skip-link" href="#main-content">Saltar al contenido</a>\n<div class="announcement">')
.replace('{{ config().name }}</a>','{{ config().name }}<small>BOUTIQUE INFANTIL</small></a>')
.replace('<a routerLink="/catalogo" [queryParams]="{genero:\'ninas\'}" routerLinkActive="active">','<a routerLink="/catalogo" [queryParams]="{genero:\'bebes\'}" routerLinkActive="active">Bebés</a>\n      <a routerLink="/catalogo" [queryParams]="{genero:\'ninas\'}" routerLinkActive="active">')
.replace('<a routerLink="/catalogo" [queryParams]="{genero:\'ninas\'}" (click)="closeNavigation()">','<a routerLink="/catalogo" [queryParams]="{genero:\'bebes\'}" (click)="closeNavigation()">Bebés</a><a routerLink="/catalogo" [queryParams]="{genero:\'ninas\'}" (click)="closeNavigation()">')
.replace('<a routerLink="/catalogo" [queryParams]="{genero:\'ninas\'}">','<a routerLink="/catalogo" [queryParams]="{genero:\'bebes\'}">Bebés</a><a routerLink="/catalogo" [queryParams]="{genero:\'ninas\'}">')
.replace('Prendas pensadas para acompañar cada momento. Una selección contemporánea, cercana y sin prisa.','Pequeñas prendas, grandes historias. Un universo de detalles delicados para acompañar el encanto de crecer.')
.replace('Hecho para vestir tu historia.','La magia está en los pequeños momentos.')
.replace('Tu próxima pieza favorita te espera.','Sus próximos favoritos te esperan.')
.replace('<main id="main-content">','<main id="main-content" tabindex="-1">')
.replace('<aside class="cart-drawer"','<aside appFocusTrap class="cart-drawer"')
);
change('src/app/app.routes.ts',s=>s.replace('Boutique contemporánea','Boutique infantil'));
change('src/index.html',s=>s.replace('Boutique contemporánea','Boutique infantil').replace('Descubre moda contemporánea para mujer y hombre en MAISON MODE.','Descubre una boutique de ropa para bebés, niñas y niños en MAISON MODE.'));
change('src/app/features/contact/contact.ts',s=>s.replace('tu próximo look.','sus pequeños momentos.').replace('Vestir bien también se siente bien.','La infancia se viste de recuerdos.').replace('¿Cómo elijo mi talla?','¿Cómo elijo su talla?'));
change('src/app/features/checkout/checkout.html',s=>s.replace('<aside class="order-summary">','<aside class="order-summary">@if (hasDemo()) { <p class="demo-disclosure">Tu selección incluye prendas de demostración. Consulta sus precios y disponibilidad reales con la tienda.</p> }'));
change('src/app/features/product/product.html',s=>s.replace('<p class="description">','@if (item.demo) { <p class="demo-disclosure">Prenda de demostración · Fotografía ilustrativa y precio referencial.</p> }<p class="description">')
.replace('<div class="size-modal"','<div appFocusTrap class="size-modal"').replace('<div class="zoom-modal"','<div appFocusTrap class="zoom-modal"')
.replace('Encuentra tu fit','Cada pequeño crece a su ritmo')
.replace('Medidas referenciales de cuerpo en centímetros. Si necesitas ayuda, consúltanos por WhatsApp.','Edades y medidas corporales orientativas en centímetros. La talla varía según la marca, el modelo y el crecimiento de cada niño.')
.replace(/<table>.*?<\/table>/s,'<table><caption class="sr-only">Referencia infantil de estatura y contorno de pecho</caption><thead><tr><th>Edad orientativa</th><th>Estatura</th><th>Pecho</th></tr></thead><tbody><tr><td>0–3 meses</td><td>50–62</td><td>36–42</td></tr><tr><td>3–6 meses</td><td>62–68</td><td>42–46</td></tr><tr><td>6–12 meses</td><td>68–80</td><td>46–50</td></tr><tr><td>12–18 meses</td><td>80–86</td><td>50–52</td></tr><tr><td>2 años</td><td>86–92</td><td>52–54</td></tr><tr><td>4 años</td><td>98–104</td><td>54–56</td></tr><tr><td>6 años</td><td>110–116</td><td>58–60</td></tr><tr><td>8 años</td><td>122–128</td><td>62–64</td></tr></tbody></table>')
.replace('Para pantalones numéricos, usa tu talla habitual. Confirma las medidas exactas con la tienda.','Mide la estatura sin zapatos y el pecho en su parte más amplia, sin apretar. Esta tabla no sustituye las medidas de cada prenda: confírmalas con la tienda por WhatsApp.'));

