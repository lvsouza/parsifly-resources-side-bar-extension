import { ExtensionBase, TabsView, ListProvider, TabView, IPage, IComponent, IService, IFolder, ContextMenuItem, ICollection, ListViewItem } from 'parsifly-extension-base';

// Envs.DEBUG = true;


new class Extension extends ExtensionBase {

  async loadPages(ref: ICollection<IPage | IFolder<IPage>>): Promise<ListViewItem[]> {
    const items = await ref.value();

    return items.map(item => {
      if (item.type === 'folder') {
        return new ListViewItem({
          key: item.id,
          initialValue: {
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
          },
          onDidMount: async (context) => {
            context.set('label', item.name);
            context.set('description', item.description || '');

            const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
            const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));
            const itemsSub = await ref.doc(item.id).collection('content').onValue(() => context.refetchChildren());

            context.onDidUnmount(async () => {
              await nameSub.unsubscribe();
              await descriptionSub.unsubscribe();
              await itemsSub.unsubscribe();
            });
          },
        })
      }

      return new ListViewItem({
        key: item.id,
        initialValue: {
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
        },
        onDidMount: async (context) => {
          context.set('label', item.name);
          context.set('description', item.description || '');

          const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
          const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

          context.onDidUnmount(async () => {
            await nameSub.unsubscribe();
            await descriptionSub.unsubscribe();
          });
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
          initialValue: {
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
          },
          onDidMount: async (context) => {
            context.set('label', item.name);
            context.set('description', item.description || '');

            const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
            const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));
            const itemsSub = await ref.doc(item.id).collection('content').onValue(() => context.refetchChildren());

            context.onDidUnmount(async () => {
              await nameSub.unsubscribe();
              await descriptionSub.unsubscribe();
              await itemsSub.unsubscribe();
            });
          },
        })
      }

      return new ListViewItem({
        key: item.id,
        initialValue: {
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
        },
        onDidMount: async (context) => {
          context.set('label', item.name);
          context.set('description', item.description || '');

          const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
          const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

          context.onDidUnmount(async () => {
            await nameSub.unsubscribe();
            await descriptionSub.unsubscribe();
          });
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
          initialValue: {
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
          },
          onDidMount: async (context) => {
            context.set('label', item.name);
            context.set('description', item.description || '');

            const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
            const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));
            const itemsSub = await ref.doc(item.id).collection('content').onValue(() => context.refetchChildren());

            context.onDidUnmount(async () => {
              await nameSub.unsubscribe();
              await descriptionSub.unsubscribe();
              await itemsSub.unsubscribe();
            });
          },
        })
      }

      return new ListViewItem({
        key: item.id,
        initialValue: {
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
        },
        onDidMount: async (context) => {
          context.set('label', item.name);
          context.set('description', item.description || '');

          const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
          const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

          context.onDidUnmount(async () => {
            await nameSub.unsubscribe();
            await descriptionSub.unsubscribe();
          });
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
            const ref = this.application.dataProviders.project();

            const projectId = await ref.field('id').value();
            const projectName = await ref.field('name').value();
            const projectDescription = await ref.field('description').value();

            return [
              new ListViewItem({
                key: projectId,
                initialValue: {
                  children: true,
                  label: projectName,
                  icon: 'VscRootFolderOpened',
                  description: projectDescription || '',
                  getItems: async () => {
                    const items = await this.loadPages(ref.collection('pages'))
                    return items;
                  },
                  onItemClick: async () => {
                    await this.application.selection.select(projectId);
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
                            title: 'Page name?',
                            placeholder: 'Example: Page1',
                            helpText: 'Type the name of the page.',
                          });
                          if (!name) return;

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
                  context.set('label', projectName);
                  context.set('description', projectDescription || '');

                  const nameSub = await ref.field('name').onValue(value => context.set('label', value));
                  const descriptionSub = await ref.field('description').onValue(value => context.set('description', value || ''));
                  const itemsSub = await ref.collection('pages').onValue(() => context.refetchChildren());

                  context.onDidUnmount(async () => {
                    await nameSub.unsubscribe();
                    await descriptionSub.unsubscribe();
                    await itemsSub.unsubscribe();
                  });
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
            const ref = this.application.dataProviders.project();

            const projectId = await ref.field('id').value();
            const projectName = await ref.field('name').value();
            const projectDescription = await ref.field('description').value();

            return [
              new ListViewItem({
                key: projectId,
                initialValue: {
                  children: true,
                  label: projectName,
                  icon: 'VscRootFolderOpened',
                  description: projectDescription || '',
                  getItems: async () => {
                    const items = await this.loadComponents(ref.collection('components'))
                    return items;
                  },
                  onItemClick: async () => {
                    await this.application.selection.select(projectId);
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

                          await ref.collection('components').add({
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

                          await ref.collection('components').add({
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
                //Será executado quando o componente for exibido na tela
                onDidMount: async (context) => {
                  context.set('label', projectName);
                  context.set('description', projectDescription || '');

                  const nameSub = await ref.field('name').onValue(value => context.set('label', value));
                  const descriptionSub = await ref.field('description').onValue(value => context.set('description', value || ''));
                  const itemsSub = await ref.collection('components').onValue(() => context.refetchChildren());

                  context.onDidUnmount(async () => {
                    await nameSub.unsubscribe();
                    await descriptionSub.unsubscribe();
                    await itemsSub.unsubscribe();
                  });
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
            const ref = this.application.dataProviders.project();

            const projectId = await ref.field('id').value();
            const projectName = await ref.field('name').value();
            const projectDescription = await ref.field('description').value();

            return [
              new ListViewItem({
                key: projectId,
                initialValue: {
                  children: true,
                  label: projectName,
                  icon: 'VscRootFolderOpened',
                  description: projectDescription || '',
                  getItems: async () => {
                    const items = await this.loadServices(ref.collection('services'))
                    return items;
                  },
                  onItemClick: async () => {
                    await this.application.selection.select(projectId);
                  },
                  getContextMenuItems: async () => {
                    return [
                      new ContextMenuItem({
                        label: 'Delete',
                        icon: 'VscTrash',
                        key: `delete:${projectId}`,
                        description: 'This action is irreversible',
                        onClick: async () => {
                          await ref.delete()
                        },
                      }),
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

                          await ref.collection('services').add({
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

                          await ref.collection('services').add({
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
                //Será executado quando o componente for exibido na tela
                onDidMount: async (context) => {
                  context.set('label', projectName);
                  context.set('description', projectDescription || '');

                  const nameSub = await ref.field('name').onValue(value => context.set('label', value));
                  const descriptionSub = await ref.field('description').onValue(value => context.set('description', value || ''));
                  const itemsSub = await ref.collection('pages').onValue(() => context.refetchChildren());

                  context.onDidUnmount(async () => {
                    await nameSub.unsubscribe();
                    await descriptionSub.unsubscribe();
                    await itemsSub.unsubscribe();
                  });
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
