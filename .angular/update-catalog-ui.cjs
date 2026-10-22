const fs=require('node:fs');
function change(path,fn){fs.writeFileSync(path,fn(fs.readFileSync(path,'utf8')));}
change('src/app/features/catalog/catalog.html',s=>s
.replace('Maison Mode / Catálogo','Un pequeño mundo de posibilidades')
.replace('Prendas que se adaptan a tu ritmo y hablan de quién eres.','Detalles delicados para bebés, niñas y niños. Encuentra sus próximos favoritos.')
.replace('<div class="page-shell catalog-layout">','@if (catalog.status() === \'demo\') { <div class="page-shell"><p class="demo-disclosure">Colección de demostración: fotografías ilustrativas, precios y existencias referenciales. Consulta la disponibilidad real con la tienda.</p></div> }<div class="page-shell catalog-layout">')
.replace('<h3>Colección</h3>','<h3>Para los pequeños</h3>')
.replace(/<button type="button" \[class.selected\]="audience\(\)===\x27mujer\x27".*?>Mujer<\/button><button.*?>Hombre<\/button>/s,'@for (option of audiences; track option.id) { <button type="button" [class.selected]="audience()===option.id" [attr.aria-pressed]="audience()===option.id" (click)="audience.set(option.id)">{{ option.name }}</button> }')
.replace('<div class="filter-group"><h3>Talla</h3>','<div class="filter-group"><h3>Colecciones especiales</h3><div class="filter-options"><button type="button" [class.selected]="!collection()" (click)="collection.set(\'\')">Todas las colecciones</button>@for (option of collections; track option.id) { <button type="button" [class.selected]="collection()===option.id" [attr.aria-pressed]="collection()===option.id" (click)="collection.set(option.id)">{{ option.name }}</button> }</div></div><div class="filter-group"><h3>Talla</h3>')
.replace("maxPrice.set($event === '' ? undefined : +$event)","maxPrice.set($event === '' || $event == null ? undefined : +$event)")
.replace("minPrice.set($event === '' ? undefined : +$event)","minPrice.set($event === '' || $event == null ? undefined : +$event)")
);
change('studio/schemaTypes/productType.ts',s=>s.replace("[{title: 'Mujer', value: 'mujer'}, {title: 'Hombre', value: 'hombre'}, {title: 'Unisex', value: 'unisex'}]","[{title: 'Bebés', value: 'bebes'}, {title: 'Niñas', value: 'ninas'}, {title: 'Niños', value: 'ninos'}]")
.replace("defineField({name: 'featured'","defineField({name: 'collections', title: 'Colecciones especiales', type: 'array', of: [defineArrayMember({type: 'string'})], options: {list: [{title: 'Nueva colección', value: 'nueva'}, {title: 'Ocasiones especiales', value: 'ocasiones'}, {title: 'Verano', value: 'verano'}, {title: 'Invierno', value: 'invierno'}]}}),\n    defineField({name: 'demo', title: 'Producto de demostración', description: 'Activa para fotografías ilustrativas, precios o existencias de muestra.', type: 'boolean', initialValue: false}),\n    defineField({name: 'featured'")
);
change('studio/scripts/seed-catalog.ts',s=>s
.replace("variants: DemoVariant[]; images: DemoImage[]","variants: DemoVariant[]; images: DemoImage[]; collections?: string[]; demo?: boolean")
.replace("if (!photo?.quadrant) throw new Error","if (!photo) throw new Error")
.replace("const croppedPath = join(tempDirectory, filename)\n        cropPhoto(join(root, 'public', photo.url.replace(/^\\//, '')), croppedPath, photo.quadrant)","const sourcePath = join(root, 'public', photo.url.replace(/^\\//, ''))\n        const croppedPath = photo.quadrant ? join(tempDirectory, filename) : sourcePath\n        if (photo.quadrant) cropPhoto(sourcePath, croppedPath, photo.quadrant)")
.replace("_key: variant.size.toLowerCase()","_key: 'size-' + variants.indexOf(variant)")
.replace("details: product.details, featured:","collections: product.collections, demo: product.demo, details: product.details, featured:")
.replace('Una forma más personal de vestir · Asesoría por WhatsApp','Pequeños detalles, momentos inolvidables · Atención por WhatsApp')
.replace("heroEyebrow: 'Nueva temporada · 2026', heroTitle: 'El estilo de', heroAccent: 'ser tú.'","heroEyebrow: 'El encanto de crecer', heroTitle: 'Pequeños estilos,', heroAccent: 'grandes momentos'")
.replace('Diseños para vestir cada versión de ti. Prendas esenciales, detalles que permanecen.','Descubre prendas únicas diseñadas para acompañar cada aventura de su infancia')
);

