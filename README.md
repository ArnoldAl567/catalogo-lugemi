# LUGEMI KIDS · Catálogo infantil

Catálogo Angular para bebés, niñas y niños. Usa datos e imágenes locales, conserva el carrito en el navegador y prepara pedidos por WhatsApp. No incorpora pagos ni un backend de pedidos.

## Vista previa y comprobaciones

- `npm start`: http://localhost:4200
- `npm run build`: salida `dist/maison-mode/browser`
- `npm test -- --watch=false`: pruebas de filtros, variantes, stock, importes, carrito y mensaje.
- `vercel.json` incluye salida y reescritura de las rutas de Angular.

## Catálogo local de demostración

La tienda muestra exclusivamente la colección definida en `src/app/data/catalog.data.ts`. No hace consultas de catálogo a servicios externos ni mantiene conexiones en vivo. Las fotografías, los precios y las existencias son ilustrativos; la interfaz y el mensaje de WhatsApp los identifican como demostración.

La identidad Lugemi Kids, sus redes sociales y el WhatsApp `+51 982 226 022` se fijan en `src/app/core/store.config.ts`.

Antes de vender, reemplaza los modelos ilustrativos con fotografías, tallas, composición, precios y existencias confirmados. Desactiva el indicador `demo` únicamente en prendas reales y completa las condiciones de entrega y cambios.

## Experiencia implementada

- Portada editorial, tarjetas visuales de bebés/niñas/niños, carrusel de destacados y secciones de temporada.
- Filtros por público, categoría, colección, talla, color y precio; talla y color deben pertenecer a la misma variante disponible.
- Fichas con galería por color, ampliación, guía de tallas orientativa, cantidad y recomendaciones.
- Carrito persistente, modificación y eliminación, cálculos en céntimos y validación de existencias.
- Mensaje con todas las prendas, variantes, cantidades, subtotales y total recalculado.
- Menú móvil, panel de filtros, navegación por teclado en los diálogos y movimiento reducido.
- Veinte fotografías WebP locales (aproximadamente 1,2 MB en total), fuentes locales y carga diferida.

## Archivos principales

- `src/app/features/home/*`: portada editorial.
- `src/app/app.*` y `src/styles.css`: navegación, pie, carrito lateral y estilo global.
- `src/app/shared/product-card.ts`, `product-photo.ts`, `focus-trap.ts`: componentes reutilizables.
- `src/app/features/catalog/*` y `product/*`: catálogo y ficha.
- `src/app/core/catalog.service.ts`: acceso al catálogo local.
- `src/app/core/cart.service.ts`, `store.utils.ts`: carrito y WhatsApp.
- `src/app/data/catalog.data.ts`: colección infantil ilustrativa.
- `public/images/`: fotografías optimizadas.

## Imágenes de demostración

Generadas con la herramienta integrada ImageGen, sin API externa configurada. Dirección de los prompts: fotografía editorial infantil realista, luz natural cálida, marfil, beige, rosa empolvado y salvia; sin texto, logotipos ni marcas de agua.

Conjunto de prompts utilizado:
- Portada: niña de cinco años con vestido rosa y niño de cuatro con camisa marfil y short beige caminando de la mano por un jardín mediterráneo.
- Categorías: tríptico con bebé vestido de punto marfil, niña con vestido rosa y niño con conjunto beige; escenarios cálidos y coherentes.
- Bebés: lámina de cuatro fotografías, cárdigan con bombacho marfil/salvia y vestido con bombacho rosa/marfil.
- Niñas: vestido rosa/beige y conjunto de blusa marfil con pantalón salvia/rosa.
- Niños: camisa marfil con short beige/celeste y polo salvia/celeste con pantalón beige.
- Abrigos: casaca con capucha salvia/beige y cárdigan rosa/marfil.

Las láminas se separaron en fotografías por variante y se comprimieron a WebP. La vista «detalle» es un acercamiento de la misma fotografía, identificado en su texto alternativo.

## Límites operativos

El catálogo prepara una solicitud: no registra la venta en un servidor, no reserva ni descuenta stock automáticamente y no confirma que el cliente haya enviado el mensaje. El negocio confirma disponibilidad, entrega y monto final por WhatsApp. La guía de tallas no sustituye las medidas específicas de cada marca o prenda.
