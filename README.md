# Lugemi Kids

Catálogo Angular de polos infantiles. La tienda muestra los ocho modelos del documento «Polo Oversize Athletic 67_FINAL.docx» proporcionado por Lugemi Kids. El carrito conserva la selección en el navegador y prepara el pedido para WhatsApp al +51 982 226 022.

## Ejecutar y comprobar

- `npm start`: abre http://127.0.0.1:4301/ e inicia la API local en el puerto 4302
- `npm run build`: genera `dist/catalogo-lugemi/browser`
- `npm test -- --watch=false`: comprueba el catálogo, los filtros, el carrito y el mensaje de pedido
- `node server/integration.test.mjs`: comprueba PostgreSQL, acceso administrativo y publicación de productos e imágenes solo con una base local aislada

La tienda lee los productos desde PostgreSQL mediante `/api/products`. Los ocho modelos incluidos en el código se muestran de inmediato mientras carga la API y sirven para inicializar una base vacía una sola vez. Sanity no participa en la tienda; la carpeta `studio/` permanece inactiva.

## Administración

El panel está en `/administrador`. Solo se puede entrar con el usuario y la contraseña configurados. Dentro del panel, «Cambiar mi contraseña» permite actualizarla tras confirmar la vigente; el hash nuevo se guarda en PostgreSQL y todas las sesiones anteriores dejan de ser válidas. Permite crear, editar y quitar productos, modificar precio y descripción, agregar colores y tallas, editar hasta siete filas de detalles del producto y cargar hasta tres imágenes por producto, asociadas a sus colores. Las fotos JPG, PNG o WebP de hasta 2 MB se guardan en PostgreSQL y se publican al guardar el producto. El acceso usa una cookie de sesión privada que dura 12 horas. Cinco intentos fallidos bloquean el ingreso durante 15 minutos.

Para ejecutar el panel localmente, crear `.env.local` con `DATABASE_URL`, `ADMIN_PASSWORD_HASH` y `SESSION_SECRET`. El usuario inicial es `admin`; se puede personalizar con `ADMIN_USERNAME` tanto localmente como en Vercel. `DATABASE_URL` es una conexión PostgreSQL. `ADMIN_PASSWORD_HASH` tiene formato `sal:hash`, donde el hash se obtiene con `scrypt` de Node.js. `SESSION_SECRET` debe ser una cadena aleatoria de al menos 32 bytes. Los valores secretos no se incluyen en Git. El servidor crea las tablas y carga los ocho productos iniciales al primer acceso. Para publicar el panel en Vercel, configurar las mismas variables en el proyecto y conectar una base PostgreSQL de Neon. Las imágenes quedan en la base y no dependen del disco temporal de Vercel.

## Colección

Cuatro polos oversize: Athletic 67, Move, Space y Fire. Cuatro polos raglán: Lion, Skate, Focus Game 07 y Music. Cada ficha tiene la fotografía frontal y posterior tomada del documento, tallas 6, 8, 10, 12, 14 y 16, y precio S/ 35.00. El nombre Skate y los precios de Fire, Lion, Skate y Focus Game 07 fueron confirmados por el propietario después de revisar el documento.

La composición de Skate y Focus Game 07 no figura en la ficha original y se muestra como pendiente de confirmación. No se proporcionó inventario por talla: el carrito permite preparar la consulta y la tienda confirma disponibilidad y envío por WhatsApp antes de cerrar la compra. Tampoco se proporcionaron medidas en centímetros, por lo que la guía invita a solicitarlas a la tienda.

## Organización

- `src/app/data/catalog.data.ts` y `server/seed-products.json`: los ocho modelos iniciales.
- `src/app/features/admin/`: panel administrativo.
- `server/core.mjs` y `api/`: API, contraseña, imágenes y PostgreSQL.
- `public/images/productos/`: las 16 fotografías originales, una de frente y otra de espalda para cada modelo.
- `src/app/features/home/`: portada y colección completa, con cuatro tarjetas por fila.
- `src/app/features/catalog/` y `src/app/features/product/`: filtros y fichas.
- `src/app/core/cart.service.ts` y `src/app/core/store.utils.ts`: carrito y pedido por WhatsApp.
- `src/app/core/store.config.ts`: identidad y enlaces de contacto.

Otto permanece fijo sobre el acceso a WhatsApp. El pedido se prepara para enviarse; no registra una venta, reserva stock ni incluye el costo de envío en el total.
