# LUGEMI KIDS · Catálogo infantil

Catálogo Angular existente, renovado para bebés, niñas y niños. Conserva Sanity, las rutas, el carrito en almacenamiento local y los pedidos por WhatsApp. No incorpora pagos ni un backend de pedidos.

## Vista previa y comprobaciones

- `npm start`: http://localhost:4200
- `npm run build`: salida `dist/maison-mode/browser`
- `npm test -- --watch=false`: pruebas de filtros, variantes, stock, importes, carrito y mensaje.
- `npm --prefix studio run typecheck`
- `npm run studio:build`
- `vercel.json` incluye salida y reescritura de las rutas de Angular.

## Datos reales y demostración

Se mantiene el proyecto Sanity configurado en `sanity.project.json`. La tienda acepta productos publicados con colección `bebes`, `ninas` o `ninos`. No modifica ni elimina los documentos anteriores.

Si Sanity no contiene prendas infantiles válidas o no responde, se muestra una colección local de demostración. Sus fotografías, precios y existencias son ilustrativos y se identifican como tales en la interfaz y en el mensaje de WhatsApp. Cuando publiques productos infantiles válidos, sustituirán la colección local completa.

La identidad Lugemi Kids, sus redes sociales y el WhatsApp `+51 982 226 022` se fijan en la configuración de la tienda. Los textos y la foto anteriores de portada solo se vuelven a usar al activar **Publicar esta portada infantil** en el panel, después de actualizarlos.

Para vender:
1. Publica el esquema actualizado del Studio.
2. Crea las prendas infantiles con fotografías reales por color, tallas, composición, precios y existencias confirmados.
3. Desactiva **Producto de demostración** únicamente en prendas reales.
4. Completa datos comerciales, entregas y cambios con información verificada.
5. Revisa el dominio final en los orígenes autorizados de Sanity.

El script de importación de muestras sigue usando `createIfNotExists`; no se ha ejecutado ninguna escritura sobre Sanity durante esta transformación. Puede cargar las nuevas fotos locales y conserva el indicador de demostración.

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
- `src/app/core/catalog.service.ts`, `sanity.repository.ts`: lectura de datos y separación de la demostración.
- `src/app/core/cart.service.ts`, `store.utils.ts`: carrito y WhatsApp.
- `src/app/data/catalog.data.ts`: colección infantil ilustrativa.
- `studio/schemaTypes/*`: categorías infantiles, colecciones y contenido editorial.
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
