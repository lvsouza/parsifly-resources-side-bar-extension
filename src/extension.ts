import { ExtensionBase, TabsView, ListProvider, Action, TabView, ListViewItem, IPage, IComponent, IService, IProject, TProjectType, IFolder, ContextMenuItem, ICollection } from 'parsifly-extension-base';

// Envs.DEBUG = true;


new class Extension extends ExtensionBase {

  async loadPages(ref: ICollection<IPage | IFolder<IPage>>): Promise<ListViewItem[]> {
    const items = await ref.value();

    return items.map(item => {
      if (item.type === 'folder') {
        return new ListViewItem({
          key: item.id,
          children: true,
          label: item.name,
          icon: 'VscFolder',
          getContextMenuItems: async () => {
            return [
              new ContextMenuItem({
                label: 'Delete',
                icon: 'VscTrash',
                key: `delete:${item.id}`,
                description: 'This action is irreversible',
                onClick: async () => {
                  await ref.doc(item.id).delete()
                },
              }),
              new ContextMenuItem({
                label: 'New page',
                icon: 'VscNewFile',
                key: `new-page:${item.id}`,
                description: 'Add to this folder a new page',
                onClick: async () => {
                  const name = await this.application.commands.editor.showQuickPick({
                    title: 'Page name',
                    placeholder: 'Example: Page1',
                    helpText: 'Type the name of the page.',
                  });
                  if (!name) return;

                  await ref.doc(item.id).collection('content').add({
                    name: name,
                    type: 'page',
                    description: '',
                    id: crypto.randomUUID(),
                  });
                },
              }),
              new ContextMenuItem({
                label: 'New folder',
                icon: 'VscNewFolder',
                key: `new-folder:${item.id}`,
                description: 'Add to this folder a new folder',
                onClick: async () => {
                  const name = await this.application.commands.editor.showQuickPick({
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
            const items = await this.loadPages(ref.doc(item.id).collection('content'))
            return items
          },
          onItemClick: async () => {
            await this.application.selection.select(item.id);
          },
        })
      }

      return new ListViewItem({
        key: item.id,
        children: false,
        label: item.name,
        icon: 'VscWindow',
        onItemClick: async () => {
          await this.application.selection.select(item.id);
        },
        onItemDoubleClick: async () => {
          await this.application.edition.open(item.id);
        },
        getContextMenuItems: async () => {
          return [
            new ContextMenuItem({
              label: 'Delete',
              icon: 'VscTrash',
              key: `delete:${item.id}`,
              description: 'This action is irreversible',
              onClick: async () => {
                await ref.doc(item.id).delete()
              },
            }),
          ];
        },
      });
    })
  }

  async loadComponents(ref: ICollection<IComponent | IFolder<IComponent>>): Promise<ListViewItem[]> {
    const items = await ref.value();

    return items.map(item => {
      if (item.type === 'folder') {
        return new ListViewItem({
          key: item.id,
          children: true,
          label: item.name,
          icon: 'VscFolder',
          getContextMenuItems: async () => {
            return [
              new ContextMenuItem({
                label: 'Delete',
                icon: 'VscTrash',
                key: `delete:${item.id}`,
                description: 'This action is irreversible',
                onClick: async () => {
                  await ref.doc(item.id).delete()
                },
              }),
              new ContextMenuItem({
                label: 'New component',
                icon: 'VscNewFile',
                key: `new-component:${item.id}`,
                description: 'Add to this folder a new component',
                onClick: async () => {
                  const name = await this.application.commands.editor.showQuickPick({
                    title: 'Component name?',
                    placeholder: 'Example: Component1',
                    helpText: 'Type the name of the component.',
                  });
                  if (!name) return;

                  await ref.doc(item.id).collection('content').add({
                    name: name,
                    description: '',
                    type: 'component',
                    id: crypto.randomUUID(),
                  });
                },
              }),
              new ContextMenuItem({
                label: 'New folder',
                icon: 'VscNewFolder',
                key: `new-folder:${item.id}`,
                description: 'Add to this folder a new folder',
                onClick: async () => {
                  const name = await this.application.commands.editor.showQuickPick({
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
            const items = await this.loadComponents(ref.doc(item.id).collection('content'))
            return items
          },
          onItemClick: async () => {
            await this.application.selection.select(item.id);
          },
        })
      }

      return new ListViewItem({
        key: item.id,
        children: false,
        draggable: true,
        label: item.name,
        icon: 'VscRuby',
        draggableData: {
          id: item.id,
          type: item.type,
          label: item.name,
        },
        onItemClick: async () => {
          await this.application.selection.select(item.id);
        },
        onItemDoubleClick: async () => {
          await this.application.edition.open(item.id);
        },
        getContextMenuItems: async () => {
          return [
            new ContextMenuItem({
              label: 'Delete',
              icon: 'VscTrash',
              key: `delete:${item.id}`,
              description: 'This action is irreversible',
              onClick: async () => {
                await ref.doc(item.id).delete()
              },
            }),
          ];
        },
      });
    })
  }

  async loadServices(ref: ICollection<IService | IFolder<IService>>): Promise<ListViewItem[]> {
    const items = await ref.value();

    return items.map(item => {
      if (item.type === 'folder') {
        return new ListViewItem({
          key: item.id,
          children: true,
          label: item.name,
          icon: 'VscFolder',
          getContextMenuItems: async () => {
            return [
              new ContextMenuItem({
                label: 'Delete',
                icon: 'VscTrash',
                key: `delete:${item.id}`,
                description: 'This action is irreversible',
                onClick: async () => {
                  await ref.doc(item.id).delete()
                },
              }),
              new ContextMenuItem({
                label: 'New service',
                icon: 'VscNewFile',
                key: `new-service:${item.id}`,
                description: 'Add to this folder a new service',
                onClick: async () => {
                  const name = await this.application.commands.editor.showQuickPick({
                    title: 'Service name?',
                    placeholder: 'Example: Service1',
                    helpText: 'Type the name of the service.',
                  });
                  if (!name) return;

                  await ref.doc(item.id).collection('content').add({
                    name: name,
                    description: '',
                    type: 'service',
                    id: crypto.randomUUID(),
                  });
                },
              }),
              new ContextMenuItem({
                label: 'New folder',
                icon: 'VscNewFolder',
                key: `new-folder:${item.id}`,
                description: 'Add to this folder a new folder',
                onClick: async () => {
                  const name = await this.application.commands.editor.showQuickPick({
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
            const items = await this.loadServices(ref.doc(item.id).collection('content'))
            return items
          },
          onItemClick: async () => {
            await this.application.selection.select(item.id);
          },
        })
      }

      return new ListViewItem({
        key: item.id,
        children: false,
        label: item.name,
        icon: 'VscSymbolMethod',
        onItemClick: async () => {
          await this.application.selection.select(item.id);
        },
        onItemDoubleClick: async () => {
          await this.application.edition.open(item.id);
        },
        getContextMenuItems: async () => {
          return [
            new ContextMenuItem({
              label: 'Delete',
              icon: 'VscTrash',
              key: `delete:${item.id}`,
              description: 'This action is irreversible',
              onClick: async () => {
                await ref.doc(item.id).delete()
              },
            }),
          ];
        },
      });
    })
  }

  resourcesListView = new TabsView({
    key: 'resources-side-bar',
    actions: [
      new Action({
        key: 'add-resources',
        action: async () => {
          const type = await this.application.commands.editor.showQuickPick({
            title: 'Type of resource?',
            placeholder: 'Example: page',
            helpText: '"page", "component" or "service"',
          });

          if (!type) return;
          if (!['page', 'component', 'service'].includes(type)) {
            this.application.commands.editor.feedback(`Type of resource ${type} not valid. Please use "page", "component" or "service".`, 'error')
            return;
          }

          const name = await this.application.commands.editor.showQuickPick({
            title: 'Name of resource?',
            placeholder: 'Example: Resource1',
            helpText: 'Type the name of the resource.',
          });
          if (!name) return;

          if (type === 'page') {
            this.application.dataProviders.project().collection<IPage>('pages').add({
              name: name,
              type: 'page',
              description: '',
              id: crypto.randomUUID(),
            });
          } else if (type === 'component') {
            this.application.dataProviders.project().collection<IComponent>('components').add({
              name: name,
              description: '',
              type: 'component',
              id: crypto.randomUUID(),
            });
          } else if (type === 'service') {
            this.application.dataProviders.project().collection<IService>('services').add({
              name: name,
              description: '',
              type: 'service',
              id: crypto.randomUUID(),
            });
          }

          this.application.views.refresh(this.resourcesListView);
        }
      }),
      new Action({
        key: 'add-folders',
        action: async () => {
          const type = await this.application.commands.editor.showQuickPick({
            title: 'Where to put the folder?',
            placeholder: 'Example: pages',
            helpText: '"pages", "components" or "services"',
          });
          if (!type) return;
          if (!['pages', 'components', 'services'].includes(type)) {
            this.application.commands.editor.feedback(`Location of resource ${type} not valid. Please use "pages", "components" or "services".`, 'error')
            return;
          }

          const name = await this.application.commands.editor.showQuickPick({
            title: 'Name of folder?',
            placeholder: 'Example: Folder',
            helpText: 'Type the name of the folder.',
          });
          if (!name) return;

          this.application.dataProviders.project().collection<IFolder>(type).add({
            name: name,
            content: [],
            type: 'folder',
            description: '',
            id: crypto.randomUUID(),
          });
        }
      }),
    ],
    tabs: [
      new TabView({
        key: 'tab-pages',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async () => {
            const pagesRef = this.application.dataProviders.project().collection<IProject<TProjectType>['pages'][number]>('pages');
            const items = await this.loadPages(pagesRef)
            return items
          },
        }),
      }),
      new TabView({
        key: 'tab-components',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async () => {
            const componentsRef = this.application.dataProviders.project().collection<IProject<TProjectType>['components'][number]>('components');
            const items = await this.loadComponents(componentsRef)
            return items
          },
        }),
      }),
      new TabView({
        key: 'tab-services',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async () => {
            const servicesRef = this.application.dataProviders.project().collection<IProject<TProjectType>['services'][number]>('services');
            const items = await this.loadServices(servicesRef)
            return items
          },
        }),
      }),
    ],
  });


  async activate() {
    console.log('EXTENSION: Activating');

    this.application.views.register(this.resourcesListView);

    await this.application.commands.editor.showPrimarySideBarByKey('resources-side-bar');
  }

  async deactivate() {
    console.log('EXTENSION: Deactivating');

    this.application.views.unregister(this.resourcesListView);
  }
};
