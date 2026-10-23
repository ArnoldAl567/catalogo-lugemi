import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import project from '../sanity.project.json'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'maison-mode',
  title: 'Lugemi Kids · Administración',
  projectId: project.projectId,
  dataset: project.dataset,
  plugins: [structureTool({
    structure: (S) => S.list().title('Administración').items([
      S.listItem().id('storeSettings').title('Datos de la tienda').child(
        S.document().schemaType('storeSettings').documentId('storeSettings'),
      ),
      S.divider(),
      S.documentTypeListItem('product').title('Productos'),
      S.documentTypeListItem('category').title('Categorías'),
    ]),
  })],
  document: {
    singletons: ['storeSettings'],
  },
  schema: {types: schemaTypes},
})
