import { ContextMenuItem, ExtensionBase, IAction, ICollection, IFolder, IProject, ListViewItem, IDoc } from 'parsifly-extension-base';



const loadActions = async (application: ExtensionBase['application'], ref: ICollection<IAction | IFolder<IAction>>): Promise<ListViewItem[]> => {
  const items = await ref.value();

  return items.map(item => {
    if (item.type === 'folder') {
      return new ListViewItem({
        key: item.id,
        initialValue: {
          children: true,
          label: item.name,
          icon: { path: 'action-global-folder.svg' },
          getContextMenuItems: async (context) => {
            return [
              new ContextMenuItem({
                label: 'New action',
                icon: { name: 'VscNewFile' },
                key: `new-action:${item.id}`,
                description: 'Add to this folder a new action',
                onClick: async () => {
                  const name = await application.commands.editor.showQuickPick({
                    title: 'Action name?',
                    placeholder: 'Example: Action1',
                    helpText: 'Type the name of the action.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  await ref.doc(item.id).collection('content').add({
                    name: name,
                    description: '',
                    type: 'action',
                    id: crypto.randomUUID(),
                  });
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

                  await ref.doc(item.id).collection('content').add({
                    name: name,
                    content: [],
                    type: 'folder',
                    description: '',
                    id: crypto.randomUUID(),
                  });
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
            const items = await loadActions(application, ref.doc(item.id).collection('content'));
            context.set('children', items.length > 0);
            return items
          },
          onItemClick: async () => {
            await application.selection.select(item.id);
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
        icon: { path: 'action-global.svg' },
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
      icon: { path: 'action-global-folder.svg' },
      getItems: async (context) => {
        const items = await loadActions(application, ref.collection('actions'));
        context.set('children', items.length > 0);
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new ContextMenuItem({
            label: 'New action',
            icon: { name: 'VscNewFile' },
            key: `new-action:actions`,
            description: 'Add to this folder a new action',
            onClick: async () => {
              const name = await application.commands.editor.showQuickPick({
                title: 'Action name?',
                placeholder: 'Example: Action1',
                helpText: 'Type the name of the action.',
              });
              if (!name) return;

              await context.set('opened', true);

              await ref.collection('actions').add({
                name: name,
                description: '',
                type: 'action',
                id: crypto.randomUUID(),
              });
            },
          }),
          new ContextMenuItem({
            label: 'New folder',
            icon: { name: 'VscNewFolder' },
            key: `new-folder:actions`,
            description: 'Add to this folder a new folder',
            onClick: async () => {
              const name = await application.commands.editor.showQuickPick({
                title: 'Folder name',
                placeholder: 'Example: Folder1',
                helpText: 'Type the name of the folder.',
              });
              if (!name) return;

              await context.set('opened', true);

              await ref.collection('actions').add({
                name: name,
                content: [],
                type: 'folder',
                description: '',
                id: crypto.randomUUID(),
              });
            },
          }),
        ];
      }
    },
    onDidMount: async (context) => {
      const itemsSub = await ref.collection('actions').onValue(() => context.refetchChildren());

      context.onDidUnmount(async () => {
        await itemsSub.unsubscribe();
      });
    },
  })
}
