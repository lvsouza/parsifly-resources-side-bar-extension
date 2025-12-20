import { ContextMenuItem, ExtensionBase, IAction, ICollection, IFolder, IProject, ListViewItem, IDoc } from 'parsifly-extension-base';



const loadActions = async (application: ExtensionBase['application'], ref: ICollection<IAction | IFolder<IAction>>): Promise<ListViewItem[]> => {
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
          icon: { type: 'action-global-folder' },
          getContextMenuItems: async (context) => {
            return [
              new ContextMenuItem({
                label: 'New action',
                key: `new-action:${item.id}`,
                icon: { type: 'action-global-add' },
                description: 'Add to this folder a new action',
                onClick: async () => {
                  const name = await application.commands.editor.showQuickPick({
                    title: 'Action name?',
                    placeholder: 'Example: Action1',
                    helpText: 'Type the name of the action.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem = {
                    name: name,
                    description: '',
                    type: 'action',
                    id: crypto.randomUUID(),
                  };

                  await ref.doc(item.id).collection('content').add(newItem);
                  await application.selection.select(newItem.id);
                },
              }),
              new ContextMenuItem({
                label: 'New folder',
                key: `new-folder:${item.id}`,
                icon: { type: 'folder-add' },
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
                icon: { type: 'delete' },
                description: 'This action is irreversible',
                onClick: async () => {
                  await ref.doc(item.id).delete()
                },
              }),
            ];
          },
          getItems: async (context) => {
            const items = await loadActions(application, ref.doc(item.id).collection('content'));
            context.set('children', items.length > 0);
            return items
          },
          onItemClick: async () => {
            await application.selection.select(item.id);
          },

          dragProvides: 'application/x.parsifly.action-folder',
          dropAccepts: [
            'application/x.parsifly.action',
            'application/x.parsifly.action-folder',
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
        icon: { type: 'action-global' },
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
              icon: { type: 'delete' },
              description: 'This action is irreversible',
              onClick: async () => {
                await ref.doc(item.id).delete()
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.action',
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

export const loadActionsFolder = (application: ExtensionBase['application'], ref: IDoc<IProject>) => {

  return new ListViewItem({
    key: 'actions-group',
    initialValue: {
      children: true,
      label: 'Actions',
      disableSelect: true,
      icon: { type: 'action-global-folder' },
      getItems: async (context) => {
        const items = await loadActions(application, ref.collection('actions'));
        context.set('children', items.length > 0);
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new ContextMenuItem({
            label: 'New action',
            key: `new-action:actions`,
            icon: { type: 'action-global-add' },
            description: 'Add to this folder a new action',
            onClick: async () => {
              const name = await application.commands.editor.showQuickPick({
                title: 'Action name?',
                placeholder: 'Example: Action1',
                helpText: 'Type the name of the action.',
              });
              if (!name) return;

              await context.set('opened', true);

              const newItem = {
                name: name,
                description: '',
                type: 'action',
                id: crypto.randomUUID(),
              };

              await ref.collection('actions').add(newItem);
              await application.selection.select(newItem.id);
            },
          }),
          new ContextMenuItem({
            label: 'New folder',
            key: `new-folder:actions`,
            icon: { type: 'folder-add' },
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

              await ref.collection('actions').add(newItem);
              await application.selection.select(newItem.id);
            },
          }),
        ];
      },

      dropAccepts: [
        'application/x.parsifly.action',
        'application/x.parsifly.action-folder',
      ],
      onDidDrop: async (_context, event) => {
        const [droppedItem, path] = await application.dataProviders.findAnyResourceByKey(event.key);
        if (!droppedItem || !path) return;

        await path.delete();
        await ref.collection('actions').add(droppedItem);

        const selectionId = await application.selection.get();
        if (selectionId.includes(droppedItem.id)) {
          await application.selection.select(droppedItem.id);
        }
      },
    },
    onDidMount: async (context) => {
      const itemsSub = await ref.collection('actions').onValue(() => context.refetchChildren());

      context.onDidUnmount(async () => {
        await itemsSub.unsubscribe();
      });
    },
  })
}
