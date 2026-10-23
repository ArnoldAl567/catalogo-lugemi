# Mascota flotante Lugemi Kids

Recurso: `lugemi-mascota-flotante.png`.
Origen: imagen `mascota.png` proporcionada por la tienda.
Preparación: herramienta integrada de generación de imágenes; fondo transparente.

Prompt utilizado:

Edit target: the attached Lugemi Kids teddy bear. Create a production web mascot asset by removing ALL background (moon, stars, clouds, wall and floor), preserving the exact beige plush teddy identity, round brown glasses, denim jacket, backpack straps, seated pose and friendly face. Single full-body bear only, no floor or cast shadow, genuine transparent alpha background, no text, no border. Center the entire bear with both ears and feet intact, tight square framing with a small transparent margin. Keep detailed soft fur and original colors. This will be a small interactive floating mascot on a children's clothing website.

El movimiento y las interacciones se implementan en el componente StoreMascot: paseo automático, arrastre, teclado, saludo, pausa, ocultación y recuperación durante la sesión. Respeta movimiento reducido y queda oculta durante los diálogos.

## Posturas animadas

Recurso: `lugemi-mascota-posturas.png`, atlas transparente de 1536 × 1024, organizado en tres columnas y dos filas. Derivado del recorte anterior con la herramienta integrada de generación de imágenes.

Prompt utilizado:

A transparent PNG animation sprite atlas, isolated cutouts on EMPTY TRANSPARENT ALPHA canvas, like the attached transparent cutout. NOT a photograph scene. Do not include any background color, gradient, floor, blur, glow or shadow. Six small identical beige plush bears in round brown glasses, blue denim jackets and black backpack straps, spaced in a strict 3 columns by 2 rows grid. Square cells. Same head size and baseline in each cell. Poses reading order: sitting, crouching to stand, standing upright, walking left leg forward, walking right leg forward, standing and waving. Both walking poses face front so opposite feet are unambiguous. Entire figures fit with 10% empty margin in each cell. Landscape 1536x1024. This is for a video game sprite sheet: fully transparent between every bear. Preserve reference identity. No text.

La secuencia intercala posturas y refleja el segundo paso para alternar los pies. El oso se levanta, camina en diagonal, saluda y se sienta. Los recorridos respetan los límites de la pantalla; se puede arrastrar, pausar u ocultar.

## Mascota fija sobre WhatsApp

Recurso nuevo: `lugemi-mascota-senala.png`, con fondo transparente. La mascota permanece en la esquina inferior derecha, por encima del botón de WhatsApp. Alterna sentarse, levantarse, saludar y señalar hacia abajo. Se retiraron el paseo, el arrastre y el movimiento por teclado. Conserva saludo, pausa, ocultación y movimiento reducido.

Prompt utilizado:

Create one transparent PNG game character sprite using this exact beige plush teddy identity, round brown glasses, blue denim jacket and black backpack straps. Full body standing front view, friendly smile, head slightly looking down. The arm on viewer RIGHT is extended diagonally DOWN toward the bottom-right corner, with paw clearly pointing downward to a WhatsApp button that will be placed BELOW the sprite externally. Other arm relaxed. Both feet visible. Square canvas, entire character centered with 10% transparent margin, no cropping. Match realistic soft fur reference. Transparent alpha background, no scene, no floor, no shadows, no text, no logos, no button, no arrows. Just the single standing bear pointing downward.
