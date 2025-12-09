import { ContextMenuItem, ExtensionBase, IStructure, ICollection, IFolder, IProject, ListViewItem, IDoc } from 'parsifly-extension-base';



const loadStructures = async (application: ExtensionBase['application'], ref: ICollection<IStructure | IFolder<IStructure>>): Promise<ListViewItem[]> => {
  const items = await ref.value();

  return items.map(item => {
    if (item.type === 'folder') {
      return new ListViewItem({
        key: item.id,
        initialValue: {
          children: true,
          label: item.name,
          icon: { path: 'folder-structure.svg' },
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

                  await ref.doc(item.id).collection('content').add({
                    name: name,
                    description: '',
                    type: 'structure',
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
          getItems: async () => {
            const items = await loadStructures(application, ref.doc(item.id).collection('content'))
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
        icon: { path: 'structure.svg' },
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

export const loadStructuresFolder = (application: ExtensionBase['application'], ref: IDoc<IProject>) => {

  return new ListViewItem({
    key: 'structures-group',
    initialValue: {
      children: true,
      label: 'Structures',
      disableSelect: true,
      icon: { path: 'folder-structure.svg' },
      getItems: async () => {
        const items = await loadStructures(application, ref.collection('structures'))
        return items;
      },
      getContextMenuItems: async () => {
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

              await ref.collection('structures').add({
                name: name,
                description: '',
                type: 'structure',
                id: crypto.randomUUID(),
              });
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

              await ref.collection('structures').add({
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
      const itemsSub = await ref.collection('structures').onValue(() => context.refetchChildren());

      context.onDidUnmount(async () => {
        await itemsSub.unsubscribe();
      });
    },
  })
}
