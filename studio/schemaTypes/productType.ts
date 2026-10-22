import {defineArrayMember, defineField, defineType} from 'sanity'

const productPhoto = defineArrayMember({
  name: 'productPhoto',
  title: 'Fotografía',
  type: 'image',
  options: {hotspot: true},
  fields: [defineField({name: 'alt', title: 'Descripción de la fotografía', type: 'string', validation: (rule) => rule.required()})],
})

const sizeStock = defineArrayMember({
  name: 'sizeStock',
  title: 'Talla y existencias',
  type: 'object',
  fields: [
    defineField({name: 'size', title: 'Talla', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'stock', title: 'Existencias', type: 'number', initialValue: 0, validation: (rule) => rule.required().integer().min(0)}),
  ],
  preview: {select: {title: 'size', subtitle: 'stock'}, prepare: ({title, subtitle}) => ({title: `Talla ${title}`, subtitle: `${subtitle ?? 0} unidades`})},
})

const colorVariant = defineArrayMember({
  name: 'colorVariant',
  title: 'Color con fotos y tallas',
  type: 'object',
  fields: [
    defineField({name: 'code', title: 'Código del color', description: 'Único por producto, en minúsculas; ejemplo: azul-marino.', type: 'string', validation: (rule) => rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)}),
    defineField({name: 'name', title: 'Nombre del color', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'hex', title: 'Muestra de color', description: 'Código hexadecimal, por ejemplo #2a3440.', type: 'string', validation: (rule) => rule.required().regex(/^#[0-9a-fA-F]{6}$/)}),
    defineField({name: 'photos', title: 'Fotos de este color', description: 'La prenda de todas estas fotos debe tener el color indicado arriba.', type: 'array', of: [productPhoto], validation: (rule) => rule.required().min(1)}),
    defineField({name: 'sizes', title: 'Tallas y existencias', type: 'array', of: [sizeStock], validation: (rule) => rule.required().min(1).custom((value) => {
      const sizes = ((value ?? []) as {size?: string}[]).map((item) => item?.size?.trim().toLowerCase()).filter(Boolean)
      return sizes.length === new Set(sizes).size || 'Cada talla debe aparecer una sola vez dentro de este color.'
    })}),
  ],
  preview: {select: {title: 'name', subtitle: 'code', media: 'photos.0'}},
})

export const productType = defineType({
  name: 'product',
  title: 'Producto',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Nombre', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Enlace del producto', type: 'slug', options: {source: 'name'}, validation: (rule) => rule.required()}),
    defineField({name: 'category', title: 'Categoría', type: 'reference', to: [{type: 'category'}], validation: (rule) => rule.required()}),
    defineField({name: 'audience', title: 'Colección', type: 'string', options: {list: [{title: 'Bebés', value: 'bebes'}, {title: 'Niñas', value: 'ninas'}, {title: 'Niños', value: 'ninos'}], layout: 'radio'}, validation: (rule) => rule.required()}),
    defineField({name: 'price', title: 'Precio en soles', type: 'number', validation: (rule) => rule.required().positive().precision(2)}),
    defineField({name: 'previousPrice', title: 'Precio anterior (opcional)', type: 'number', validation: (rule) => rule.min(0).precision(2)}),
    defineField({name: 'badge', title: 'Etiqueta', type: 'string', options: {list: ['Nuevo', 'Oferta', 'Más vendido']}}),
    defineField({name: 'description', title: 'Descripción', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'material', title: 'Material y composición', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'details', title: 'Detalles de la prenda', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'collections', title: 'Colecciones especiales', type: 'array', of: [defineArrayMember({type: 'string'})], options: {list: [{title: 'Nueva colección', value: 'nueva'}, {title: 'Ocasiones especiales', value: 'ocasiones'}, {title: 'Verano', value: 'verano'}, {title: 'Invierno', value: 'invierno'}]}}),
    defineField({name: 'demo', title: 'Producto de demostración', description: 'Activa para fotografías ilustrativas, precios o existencias de muestra.', type: 'boolean', initialValue: false}),
    defineField({name: 'featured', title: 'Destacar en la portada', type: 'boolean', initialValue: false}),
    defineField({name: 'active', title: 'Mostrar en el catálogo', type: 'boolean', initialValue: true}),
    defineField({name: 'colors', title: 'Colores, fotos y tallas', type: 'array', of: [colorVariant], validation: (rule) => rule.required().min(1).custom((value) => {
      const codes = ((value ?? []) as {code?: string}[]).map((item) => item?.code).filter(Boolean)
      return codes.length === new Set(codes).size || 'Cada color debe tener un código distinto.'
    })}),
  ],
  preview: {select: {title: 'name', subtitle: 'audience', media: 'colors.0.photos.0'}},
  orderings: [
    {title: 'Más recientes', name: 'recent', by: [{field: '_createdAt', direction: 'desc'}]},
    {title: 'Precio: menor a mayor', name: 'priceAsc', by: [{field: 'price', direction: 'asc'}]},
  ],
})
