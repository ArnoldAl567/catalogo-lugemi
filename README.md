# Lugemi Kids

Catálogo Angular de polos infantiles. La tienda muestra los ocho modelos del documento «Polo Oversize Athletic 67_FINAL.docx» proporcionado por Lugemi Kids. El carrito conserva la selección en el navegador y prepara el pedido para WhatsApp al +51 982 226 022.

## Ejecutar y comprobar

- `npm start`: abre http://127.0.0.1:4301/
- `npm run build`: genera `dist/catalogo-lugemi/browser`
- `npm test -- --watch=false`: comprueba el catálogo, los filtros, el carrito y el mensaje de pedido

La tienda usa datos locales; no consulta Sanity ni un servicio de inventario. La carpeta `studio/` permanece inactiva.

## Colección

Cuatro polos oversize: Athletic 67, Move, Space y Fire. Cuatro polos raglán: Lion, Skate, Focus Game 07 y Music. Cada ficha tiene la fotografía frontal y posterior tomada del documento, tallas 6, 8, 10, 12, 14 y 16, y precio S/ 35.00. El nombre Skate y los precios de Fire, Lion, Skate y Focus Game 07 fueron confirmados por el propietario después de revisar el documento.

La composición de Skate y Focus Game 07 no figura en la ficha original y se muestra como pendiente de confirmación. No se proporcionó inventario por talla: el carrito permite preparar la consulta y la tienda confirma disponibilidad y envío por WhatsApp antes de cerrar la compra. Tampoco se proporcionaron medidas en centímetros, por lo que la guía invita a solicitarlas a la tienda.

## Organización

- `src/app/data/catalog.data.ts`: los ocho modelos y sus datos.
- `public/images/productos/`: las 16 fotografías originales, una de frente y otra de espalda para cada modelo.
- `src/app/features/home/`: portada y colección completa, con cuatro tarjetas por fila.
- `src/app/features/catalog/` y `src/app/features/product/`: filtros y fichas.
- `src/app/core/cart.service.ts` y `src/app/core/store.utils.ts`: carrito y pedido por WhatsApp.
- `src/app/core/store.config.ts`: identidad y enlaces de contacto.

Otto permanece fijo sobre el acceso a WhatsApp. El pedido se prepara para enviarse; no registra una venta, reserva stock ni incluye el costo de envío en el total.
