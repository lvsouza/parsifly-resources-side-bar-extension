import { ContextMenuItem, ExtensionBase, IPage, ICollection, IFolder, IProject, ListViewItem, IDoc } from 'parsifly-extension-base';



const loadPages = async (application: ExtensionBase['application'], ref: ICollection<IPage | IFolder<IPage>>): Promise<ListViewItem[]> => {
  const items = await ref.value();

  return items.map(item => {
    if (item.type === 'folder') {
      return new ListViewItem({
        key: item.id,
        initialValue: {
          children: false,
          label: item.name,
          icon: { path: 'folder-page.svg' },
          getContextMenuItems: async (context) => {
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
              new ContextMenuItem({
                label: 'New page',
                icon: { name: 'VscNewFile' },
                key: `new-page:${item.id}`,
                description: 'Add to this folder a new page',
                onClick: async () => {
                  const name = await application.commands.editor.showQuickPick({
                    title: 'Page name?',
                    placeholder: 'Example: Page1',
                    helpText: 'Type the name of the page.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  await ref.doc(item.id).collection('content').add({
                    name: name,
                    description: '',
                    type: 'page',
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
            ];
          },
          getItems: async (context) => {
            const items = await loadPages(application, ref.doc(item.id).collection('content'));
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
        icon: { path: 'page.svg' },
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

export const loadPagesFolder = (application: ExtensionBase['application'], ref: IDoc<IProject>) => {

  return new ListViewItem({
    key: 'pages-group',
    initialValue: {
      opened: true,
      label: 'Pages',
      children: false,
      disableSelect: true,
      icon: { path: 'folder-page.svg' },
      getItems: async (context) => {
        const items = await loadPages(application, ref.collection('pages'));
        context.set('children', items.length > 0);
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new ContextMenuItem({
            label: 'New page',
            icon: { name: 'VscNewFile' },
            key: `new-page:pages`,
            description: 'Add to this folder a new page',
            onClick: async () => {
              const name = await application.commands.editor.showQuickPick({
                title: 'Page name?',
                placeholder: 'Example: Page1',
                helpText: 'Type the name of the page.',
              });
              if (!name) return;

              await context.set('opened', true);

              await ref.collection('pages').add({
                name: name,
                description: '',
                type: 'page',
                id: crypto.randomUUID(),
              });
            },
          }),
          new ContextMenuItem({
            label: 'New folder',
            icon: { name: 'VscNewFolder' },
            key: `new-folder:pages`,
            description: 'Add to this folder a new folder',
            onClick: async () => {
              const name = await application.commands.editor.showQuickPick({
                title: 'Folder name',
                placeholder: 'Example: Folder1',
                helpText: 'Type the name of the folder.',
              });
              if (!name) return;

              await context.set('opened', true);

              await ref.collection('pages').add({
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
      const itemsSub = await ref.collection('pages').onValue(() => context.refetchChildren());

      context.onDidUnmount(async () => {
        await itemsSub.unsubscribe();
      });
    },
  })
}
