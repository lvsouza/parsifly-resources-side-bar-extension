import { ContextMenuItem, ExtensionBase, IStructure, ICollection, IFolder, IProject, ListViewItem, IDoc, IStructureAttribute, Envs } from 'parsifly-extension-base';

Envs.DEBUG = false;

const loadStructureAttributes = async (application: ExtensionBase['application'], ref: ICollection<IStructureAttribute>): Promise<ListViewItem[]> => {
  const items = await ref.value();

  items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

  return items.map(item => {
    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: false,
        label: item.name,
        icon: { type: 'structure-attribute' },
        onItemClick: async () => {
          await application.selection.select(item.id);
        },
        getItems: async (context) => {
          const items = await loadStructureAttributes(application, ref.doc(item.id).collection('attributes'))
          context.set('children', items.length > 0);
          context.set('icon', items.length > 0 ? { type: 'substructure' } : { type: 'structure-attribute' });
          return items
        },
        getContextMenuItems: async (context) => {
          return [
            new ContextMenuItem({
              label: 'New attribute',
              icon: { name: 'VscNewFile' },
              key: `new-structure-attribute:${item.id}`,
              description: 'Add to this structure a new attribute',
              onClick: async () => {
                const name = await application.commands.editor.showQuickPick({
                  title: 'Attribute name?',
                  placeholder: 'Example: Attribute1',
                  helpText: 'Type the name of the attribute.',
                });
                if (!name) return;

                await context.set('opened', true);

                const newItem = {
                  name: name,
                  description: '',
                  id: crypto.randomUUID(),
                  type: 'structure_attribute',
                };

                await ref.doc(item.id).collection('attributes').add(newItem);
                await application.selection.select(newItem.id);
              },
            }),
            new ContextMenuItem({
              label: 'Delete',
              key: `delete:${item.id}`,
              icon: { name: 'VscTrash' },
              description: 'This action is irreversible',
              onClick: async () => {
                await ref.doc(item.id).delete()
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.structure-attribute',
        dropAccepts: [
          /* 'application/x.parsifly.structure',
          'application/x.parsifly.substructure',
          'application/x.parsifly.structure-attribute', */
        ],
        onDidDrop: async (_context, event) => {
          const [droppedItem, path] = await application.dataProviders.findAnyResourceByKey(event.key);
          if (!droppedItem || !path) return;

          await path.delete();
          await ref.doc(item.id).collection('content').add(droppedItem);

          const selectionId = await application.selection.get();
          if (selectionId.includes(droppedItem.id)) {
            await application.selection.select(droppedItem.id);
          }
        },
      },
      onDidMount: async (context) => {
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await application.selection.get();
        context.select(selectionIds.includes(item.id));

        const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
        const selectionSub = application.selection.subscribe(key => context.select(key.includes(item.id)));
        const itemsSub = await ref.doc(item.id).collection('attributes').onValue(() => context.refetchChildren());
        const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

        context.onDidUnmount(async () => {
          selectionSub();
          await itemsSub.unsubscribe();
          await nameSub.unsubscribe();
          await descriptionSub.unsubscribe();
        });
      },
    });
  });
}

const loadStructures = async (application: ExtensionBase['application'], ref: ICollection<IStructure | IFolder<IStructure>>): Promise<ListViewItem[]> => {
  const items = await ref.value();

  items.sort((a, b) => {
    const isFolderA = a.type === 'folder';
    const isFolderB = b.type === 'folder';

    // Primeiro: folders antes de não-folders
    if (isFolderA && !isFolderB) return -1;
    if (!isFolderA && isFolderB) return 1;

    // Depois: ordem alfabética pelo nome
    return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
  });

  return items.map(item => {
    if (item.type === 'folder') {
      return new ListViewItem({
        key: item.id,
        initialValue: {
          children: false,
          label: item.name,
          icon: { type: 'structure-folder' },
          onItemClick: async () => {
            await application.selection.select(item.id);
          },
          getContextMenuItems: async (context) => {
            return [
              new ContextMenuItem({
                label: 'New structure',
                icon: { name: 'VscNewFile' },
                key: `new-structure:${item.id}`,
                description: 'Add to this folder a new structure',
                onClick: async () => {
                  const name = await application.commands.editor.showQuickPick({
                    title: 'Structure name?',
                    placeholder: 'Example: Structure1',
                    helpText: 'Type the name of the structure.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem = {
                    name: name,
                    description: '',
                    type: 'structure',
                    id: crypto.randomUUID(),
                  };

                  await ref.doc(item.id).collection('content').add(newItem);
                  await application.selection.select(newItem.id);
                },
              }),
              new ContextMenuItem({
                label: 'New folder',
                key: `new-folder:${item.id}`,
                icon: { name: 'VscNewFolder' },
                description: 'Add to this folder a new folder',
                onClick: async () => {
                  const name = await application.commands.editor.showQuickPick({
                    title: 'Folder name',
                    placeholder: 'Example: Folder1',
                    helpText: 'Type the name of the folder.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem = {
                    name: name,
                    content: [],
                    type: 'folder',
                    description: '',
                    id: crypto.randomUUID(),
                  };

                  await ref.doc(item.id).collection('content').add(newItem);
                  await application.selection.select(newItem.id);
                },
              }),
              new ContextMenuItem({
                label: 'Delete',
                key: `delete:${item.id}`,
                icon: { name: 'VscTrash' },
                description: 'This action is irreversible',
                onClick: async () => {
                  await ref.doc(item.id).delete()
                },
              }),
            ];
          },
          getItems: async (context) => {
            const items = await loadStructures(application, ref.doc(item.id).collection('content'));
            context.set('children', items.length > 0);
            return items
          },

          dragProvides: 'application/x.parsifly.structure-folder',
          dropAccepts: [
            'application/x.parsifly.structure',
            'application/x.parsifly.structure-folder',
          ],
          onDidDrop: async (_context, event) => {
            const [droppedItem, path] = await application.dataProviders.findAnyResourceByKey(event.key);
            if (!droppedItem || !path) return;

            await path.delete();
            await ref.doc(item.id).collection('content').add(droppedItem);

            const selectionId = await application.selection.get();
            if (selectionId.includes(droppedItem.id)) {
              await application.selection.select(droppedItem.id);
            }
          },
        },
        onDidMount: async (context) => {
          context.set('label', item.name);
          context.set('description', item.description || '');

          const selectionIds = await application.selection.get();
          context.select(selectionIds.includes(item.id));

          const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
          const selectionSub = application.selection.subscribe(key => context.select(key.includes(item.id)));
          const itemsSub = await ref.doc(item.id).collection('content').onValue(() => context.refetchChildren());
          const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

          context.onDidUnmount(async () => {
            selectionSub();
            await nameSub.unsubscribe();
            await itemsSub.unsubscribe();
            await descriptionSub.unsubscribe();
          });
        },
      })
    }

    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: false,
        label: item.name,
        icon: { type: 'structure' },
        onItemClick: async () => {
          await application.selection.select(item.id);
        },
        getItems: async (context) => {
          const items = await loadStructureAttributes(application, ref.doc(item.id).collection('attributes'));
          context.set('children', items.length > 0);
          return items
        },
        getContextMenuItems: async (context) => {
          return [
            new ContextMenuItem({
              label: 'New attribute',
              icon: { name: 'VscNewFile' },
              key: `new-structure-attribute:${item.id}`,
              description: 'Add to this structure a new attribute',
              onClick: async () => {
                const name = await application.commands.editor.showQuickPick({
                  title: 'Attribute name?',
                  placeholder: 'Example: Attribute1',
                  helpText: 'Type the name of the attribute.',
                });
                if (!name) return;

                await context.set('opened', true);

                const newItem = {
                  name: name,
                  description: '',
                  id: crypto.randomUUID(),
                  type: 'structure_attribute',
                };

                await ref.doc(item.id).collection('attributes').add(newItem);
                await application.selection.select(newItem.id);
              },
            }),
            new ContextMenuItem({
              label: 'Delete',
              key: `delete:${item.id}`,
              icon: { name: 'VscTrash' },
              description: 'This action is irreversible',
              onClick: async () => {
                await ref.doc(item.id).delete()
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.structure',
        dropAccepts: [
          /* 'application/x.parsifly.structure', */
          'application/x.parsifly.substructure',
          'application/x.parsifly.structure-attribute',
        ],
        onDidDrop: async (_context, event) => {
          const [droppedItem, path] = await application.dataProviders.findAnyResourceByKey(event.key);
          if (!droppedItem || !path) return;

          await path.delete();
          await ref.doc(item.id).collection('attributes').add(droppedItem);

          const selectionId = await application.selection.get();
          if (selectionId.includes(droppedItem.id)) {
            await application.selection.select(droppedItem.id);
          }
        },
      },
      onDidMount: async (context) => {
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await application.selection.get();
        context.select(selectionIds.includes(item.id));

        const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
        const selectionSub = application.selection.subscribe(key => context.select(key.includes(item.id)));
        const itemsSub = await ref.doc(item.id).collection('attributes').onValue(() => context.refetchChildren());
        const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

        context.onDidUnmount(async () => {
          selectionSub();
          await nameSub.unsubscribe();
          await itemsSub.unsubscribe();
          await descriptionSub.unsubscribe();
        });
      },
    });
  });
}

export const loadStructuresFolder = (application: ExtensionBase['application'], ref: IDoc<IProject>) => {

  return new ListViewItem({
    key: 'structures-group',
    initialValue: {
      children: false,
      label: 'Structures',
      disableSelect: true,
      icon: { type: 'structure-folder' },
      getItems: async (context) => {
        const items = await loadStructures(application, ref.collection('structures'));
        context.set('children', items.length > 0);
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new ContextMenuItem({
            label: 'New structure',
            icon: { name: 'VscNewFile' },
            key: `new-structure:structures`,
            description: 'Add to this folder a new structure',
            onClick: async () => {
              const name = await application.commands.editor.showQuickPick({
                title: 'Structure name?',
                placeholder: 'Example: Structure1',
                helpText: 'Type the name of the structure.',
              });
              if (!name) return;

              await context.set('opened', true);

              const newItem = {
                name: name,
                description: '',
                type: 'structure',
                id: crypto.randomUUID(),
              };

              await ref.collection('structures').add(newItem);
              await application.selection.select(newItem.id);
            },
          }),
          new ContextMenuItem({
            label: 'New folder',
            icon: { name: 'VscNewFolder' },
            key: `new-folder:structures`,
            description: 'Add to this folder a new folder',
            onClick: async () => {
              const name = await application.commands.editor.showQuickPick({
                title: 'Folder name',
                placeholder: 'Example: Folder1',
                helpText: 'Type the name of the folder.',
              });
              if (!name) return;

              await context.set('opened', true);

              const newItem = {
                name: name,
                content: [],
                type: 'folder',
                description: '',
                id: crypto.randomUUID(),
              };

              await ref.collection('structures').add(newItem);
              await application.selection.select(newItem.id);
            },
          }),
        ];
      },

      dropAccepts: [
        'application/x.parsifly.structure',
        'application/x.parsifly.structure-folder',
      ],
      onDidDrop: async (_context, event) => {
        const [droppedItem, path] = await application.dataProviders.findAnyResourceByKey(event.key);
        if (!droppedItem || !path) return;

        await path.delete();
        await ref.collection('structures').add(droppedItem);

        const selectionId = await application.selection.get();
        if (selectionId.includes(droppedItem.id)) {
          await application.selection.select(droppedItem.id);
        }
      },
    },
    onDidMount: async (context) => {
      const itemsSub = await ref.collection('structures').onValue(() => context.refetchChildren());

      context.onDidUnmount(async () => {
        await itemsSub.unsubscribe();
      });
    },
  })
}
