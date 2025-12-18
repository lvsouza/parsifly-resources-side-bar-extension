import { ContextMenuItem, ExtensionBase, IComponent, ICollection, IFolder, IProject, ListViewItem, IDoc } from 'parsifly-extension-base';



const loadComponents = async (application: ExtensionBase['application'], ref: ICollection<IComponent | IFolder<IComponent>>): Promise<ListViewItem[]> => {
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
          children: true,
          label: item.name,
          icon: { type: 'component-folder' },
          getContextMenuItems: async (context) => {
            return [
              new ContextMenuItem({
                label: 'New component',
                icon: { name: 'VscNewFile' },
                key: `new-component:${item.id}`,
                description: 'Add to this folder a new component',
                onClick: async () => {
                  const name = await application.commands.editor.showQuickPick({
                    title: 'Component name?',
                    placeholder: 'Example: Component1',
                    helpText: 'Type the name of the component.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem = {
                    name: name,
                    description: '',
                    type: 'component',
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
            const items = await loadComponents(application, ref.doc(item.id).collection('content'));
            context.set('children', items.length > 0);
            return items
          },
          onItemClick: async () => {
            await application.selection.select(item.id);
          },

          dragProvides: 'application/x.parsifly.component-folder',
          dropAccepts: [
            'application/x.parsifly.component',
            'application/x.parsifly.component-folder',
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

          const editionSub = application.edition.subscribe(key => context.edit(key === item.id));
          const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
          const itemsSub = await ref.doc(item.id).collection('content').onValue(() => context.refetchChildren());
          const selectionSub = application.selection.subscribe(key => context.select(key.includes(item.id)));
          const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

          context.onDidUnmount(async () => {
            editionSub();
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
        icon: { type: 'component' },
        onItemClick: async () => {
          await application.selection.select(item.id);
        },
        onItemDoubleClick: async () => {
          await application.edition.open(item.id);
        },
        getContextMenuItems: async () => {
          return [
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

        dragProvides: 'application/x.parsifly.component',
      },
      onDidMount: async (context) => {
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await application.selection.get();
        const editionId = await application.edition.get();
        context.select(selectionIds.includes(item.id));
        context.edit(editionId === item.id);

        const editionSub = application.edition.subscribe(key => context.edit(key === item.id));
        const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
        const selectionSub = application.selection.subscribe(key => context.select(key.includes(item.id)));
        const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

        context.onDidUnmount(async () => {
          editionSub();
          selectionSub();
          await nameSub.unsubscribe();
          await descriptionSub.unsubscribe();
        });
      },
    });
  });
}

export const loadComponentsFolder = (application: ExtensionBase['application'], ref: IDoc<IProject>) => {

  return new ListViewItem({
    key: 'components-group',
    initialValue: {
      children: true,
      label: 'Components',
      disableSelect: true,
      icon: { type: 'component-folder' },
      getItems: async (context) => {
        const items = await loadComponents(application, ref.collection('components'));
        context.set('children', items.length > 0);
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new ContextMenuItem({
            label: 'New component',
            icon: { name: 'VscNewFile' },
            key: `new-component:components`,
            description: 'Add to this folder a new component',
            onClick: async () => {
              const name = await application.commands.editor.showQuickPick({
                title: 'Component name?',
                placeholder: 'Example: Component1',
                helpText: 'Type the name of the component.',
              });
              if (!name) return;

              await context.set('opened', true);

              const newItem = {
                name: name,
                description: '',
                type: 'component',
                id: crypto.randomUUID(),
              };

              await ref.collection('components').add(newItem);
              await application.selection.select(newItem.id);
            },
          }),
          new ContextMenuItem({
            label: 'New folder',
            icon: { name: 'VscNewFolder' },
            key: `new-folder:components`,
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

              await ref.collection('components').add(newItem);
              await application.selection.select(newItem.id);
            },
          }),
        ];
      },

      dropAccepts: [
        'application/x.parsifly.component',
        'application/x.parsifly.component-folder',
      ],
      onDidDrop: async (_context, event) => {
        const [droppedItem, path] = await application.dataProviders.findAnyResourceByKey(event.key);
        if (!droppedItem || !path) return;

        await path.delete();
        await ref.collection('components').add(droppedItem);

        const selectionId = await application.selection.get();
        if (selectionId.includes(droppedItem.id)) {
          await application.selection.select(droppedItem.id);
        }
      },
    },
    onDidMount: async (context) => {
      const itemsSub = await ref.collection('components').onValue(() => context.refetchChildren());

      context.onDidUnmount(async () => {
        await itemsSub.unsubscribe();
      });
    },
  })
}
