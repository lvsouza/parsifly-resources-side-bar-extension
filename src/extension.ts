import { ExtensionBase, TabsView, ListProvider, TabView, ListViewItem, IPage, IComponent, IService, IProject, TProjectType, IFolder, ContextMenuItem, ICollection } from 'parsifly-extension-base';

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
    tabs: [
      new TabView({
        key: 'tab-pages',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async () => {
            const projectId = await this.application.dataProviders.project().field('id').value();
            const projectName = await this.application.dataProviders.project().field('name').value();
            const projectDescription = await this.application.dataProviders.project().field('description').value();
            return [
              new ListViewItem({
                key: projectId,
                children: true,
                label: projectName,
                icon: 'VscRootFolderOpened',
                description: projectDescription || '',
                onItemClick: async () => {
                  await this.application.selection.select(projectId);
                },
                getItems: async () => {
                  const pagesRef = this.application.dataProviders.project().collection<IProject<TProjectType>['pages'][number]>('pages');
                  const items = await this.loadPages(pagesRef)
                  return items;
                },
                getContextMenuItems: async () => {
                  return [
                    new ContextMenuItem({
                      label: 'New page',
                      icon: 'VscNewFile',
                      key: `new-page:${projectId}`,
                      description: 'Add to this folder a new page',
                      onClick: async () => {
                        const name = await this.application.commands.editor.showQuickPick({
                          title: 'Page name',
                          placeholder: 'Example: Page1',
                          helpText: 'Type the name of the page.',
                        });
                        if (!name) return;

                        await this.application.dataProviders.project().collection('pages').add({
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
                      key: `new-folder:${projectId}`,
                      description: 'Add to this folder a new folder',
                      onClick: async () => {
                        const name = await this.application.commands.editor.showQuickPick({
                          title: 'Folder name',
                          placeholder: 'Example: Folder1',
                          helpText: 'Type the name of the folder.',
                        });
                        if (!name) return;

                        await this.application.dataProviders.project().collection('pages').add({
                          name: name,
                          content: [],
                          type: 'folder',
                          description: '',
                          id: crypto.randomUUID(),
                        });
                      },
                    }),
                  ]
                }
              })
            ];
          },
        }),
      }),
      new TabView({
        key: 'tab-components',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async () => {
            const projectId = await this.application.dataProviders.project().field('id').value();
            const projectName = await this.application.dataProviders.project().field('name').value();
            const projectDescription = await this.application.dataProviders.project().field('description').value();
            return [
              new ListViewItem({
                key: projectId,
                children: true,
                label: projectName,
                icon: 'VscRootFolderOpened',
                description: projectDescription || '',
                onItemClick: async () => {
                  await this.application.selection.select(projectId);
                },
                getItems: async () => {
                  const componentsRef = this.application.dataProviders.project().collection<IProject<TProjectType>['components'][number]>('components');
                  const items = await this.loadComponents(componentsRef)
                  return items;
                },
                getContextMenuItems: async () => {
                  return [
                    new ContextMenuItem({
                      label: 'New component',
                      icon: 'VscNewFile',
                      key: `new-component:${projectId}`,
                      description: 'Add to this folder a new component',
                      onClick: async () => {
                        const name = await this.application.commands.editor.showQuickPick({
                          title: 'Component name?',
                          placeholder: 'Example: Component1',
                          helpText: 'Type the name of the component.',
                        });
                        if (!name) return;

                        await this.application.dataProviders.project().collection('components').add({
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
                      key: `new-folder:${projectId}`,
                      description: 'Add to this folder a new folder',
                      onClick: async () => {
                        const name = await this.application.commands.editor.showQuickPick({
                          title: 'Folder name',
                          placeholder: 'Example: Folder1',
                          helpText: 'Type the name of the folder.',
                        });
                        if (!name) return;

                        await this.application.dataProviders.project().collection('components').add({
                          name: name,
                          content: [],
                          type: 'folder',
                          description: '',
                          id: crypto.randomUUID(),
                        });
                      },
                    }),
                  ]
                }
              })
            ];
          },
        }),
      }),
      new TabView({
        key: 'tab-services',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async () => {
            const projectId = await this.application.dataProviders.project().field('id').value();
            const projectName = await this.application.dataProviders.project().field('name').value();
            const projectDescription = await this.application.dataProviders.project().field('description').value();
            return [
              new ListViewItem({
                key: projectId,
                children: true,
                label: projectName,
                icon: 'VscRootFolderOpened',
                description: projectDescription || '',
                onItemClick: async () => {
                  await this.application.selection.select(projectId);
                },
                getItems: async () => {
                  const servicesRef = this.application.dataProviders.project().collection<IProject<TProjectType>['services'][number]>('services');
                  const items = await this.loadServices(servicesRef)
                  return items;
                },
                getContextMenuItems: async () => {
                  return [
                    new ContextMenuItem({
                      label: 'New service',
                      icon: 'VscNewFile',
                      key: `new-service:${projectId}`,
                      description: 'Add to this folder a new service',
                      onClick: async () => {
                        const name = await this.application.commands.editor.showQuickPick({
                          title: 'Service name?',
                          placeholder: 'Example: Service1',
                          helpText: 'Type the name of the service.',
                        });
                        if (!name) return;

                        await this.application.dataProviders.project().collection('services').add({
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
                      key: `new-folder:${projectId}`,
                      description: 'Add to this folder a new folder',
                      onClick: async () => {
                        const name = await this.application.commands.editor.showQuickPick({
                          title: 'Folder name',
                          placeholder: 'Example: Folder1',
                          helpText: 'Type the name of the folder.',
                        });
                        if (!name) return;

                        await this.application.dataProviders.project().collection('services').add({
                          name: name,
                          content: [],
                          type: 'folder',
                          description: '',
                          id: crypto.randomUUID(),
                        });
                      },
                    }),
                  ]
                }
              })
            ];
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
