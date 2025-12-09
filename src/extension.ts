import { ExtensionBase, ListProvider, IPage, IComponent, IAction, IFolder, ContextMenuItem, ICollection, ListViewItem, View } from 'parsifly-extension-base';

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
            icon: { name: 'VscFolder' },
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
                  label: 'New page',
                  key: `new-page:${item.id}`,
                  icon: { name: 'VscNewFile' },
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
                  key: `new-folder:${item.id}`,
                  icon: { name: 'VscNewFolder' },
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

            const selectionIds = await this.application.selection.get();
            context.select(selectionIds.includes(item.id));

            const editionSub = this.application.edition.subscribe(key => context.edit(key === item.id));
            const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
            const itemsSub = await ref.doc(item.id).collection('content').onValue(() => context.refetchChildren());
            const selectionSub = this.application.selection.subscribe(key => context.select(key.includes(item.id)));
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
          icon: { name: 'VscWindow' },
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

          const selectionIds = await this.application.selection.get();
          const editionId = await this.application.edition.get();
          context.select(selectionIds.includes(item.id));
          context.edit(editionId === item.id);

          const editionSub = this.application.edition.subscribe(key => context.edit(key === item.id));
          const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
          const selectionSub = this.application.selection.subscribe(key => context.select(key.includes(item.id)));
          const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

          context.onDidUnmount(async () => {
            editionSub();
            selectionSub();
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
            icon: { name: 'VscFolder' },
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
                  label: 'New component',
                  icon: { name: 'VscNewFile' },
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
                  key: `new-folder:${item.id}`,
                  icon: { name: 'VscNewFolder' },
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

            const selectionIds = await this.application.selection.get();
            context.select(selectionIds.includes(item.id));

            const editionSub = this.application.edition.subscribe(key => context.edit(key === item.id));
            const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
            const itemsSub = await ref.doc(item.id).collection('content').onValue(() => context.refetchChildren());
            const selectionSub = this.application.selection.subscribe(key => context.select(key.includes(item.id)));
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
          draggable: true,
          label: item.name,
          icon: { name: 'VscRuby' },
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

          const selectionIds = await this.application.selection.get();
          const editionId = await this.application.edition.get();
          context.select(selectionIds.includes(item.id));
          context.edit(editionId === item.id);

          const editionSub = this.application.edition.subscribe(key => context.edit(key === item.id));
          const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
          const selectionSub = this.application.selection.subscribe(key => context.select(key.includes(item.id)));
          const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

          context.onDidUnmount(async () => {
            editionSub();
            selectionSub();
            await nameSub.unsubscribe();
            await descriptionSub.unsubscribe();
          });
        },
      });
    })
  }

  async loadActions(ref: ICollection<IAction | IFolder<IAction>>): Promise<ListViewItem[]> {
    const items = await ref.value();

    return items.map(item => {
      if (item.type === 'folder') {
        return new ListViewItem({
          key: item.id,
          initialValue: {
            children: true,
            label: item.name,
            icon: { name: 'VscFolder' },
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
                  label: 'New action',
                  icon: { name: 'VscNewFile' },
                  key: `new-action:${item.id}`,
                  description: 'Add to this folder a new action',
                  onClick: async () => {
                    const name = await this.application.commands.editor.showQuickPick({
                      title: 'Action name?',
                      placeholder: 'Example: Action1',
                      helpText: 'Type the name of the action.',
                    });
                    if (!name) return;

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
              const items = await this.loadActions(ref.doc(item.id).collection('content'))
              return items
            },
            onItemClick: async () => {
              await this.application.selection.select(item.id);
            },
          },
          onDidMount: async (context) => {
            context.set('label', item.name);
            context.set('description', item.description || '');

            const selectionIds = await this.application.selection.get();
            context.select(selectionIds.includes(item.id));

            const editionSub = this.application.edition.subscribe(key => context.edit(key === item.id));
            const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
            const itemsSub = await ref.doc(item.id).collection('content').onValue(() => context.refetchChildren());
            const selectionSub = this.application.selection.subscribe(key => context.select(key.includes(item.id)));
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
          icon: { name: 'VscSymbolMethod' },
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

          const selectionIds = await this.application.selection.get();
          const editionId = await this.application.edition.get();
          context.select(selectionIds.includes(item.id));
          context.edit(editionId === item.id);

          const editionSub = this.application.edition.subscribe(key => context.edit(key === item.id));
          const nameSub = await ref.doc(item.id).field('name').onValue(value => context.set('label', value));
          const selectionSub = this.application.selection.subscribe(key => context.select(key.includes(item.id)));
          const descriptionSub = await ref.doc(item.id).field('description').onValue(value => context.set('description', value || ''));

          context.onDidUnmount(async () => {
            editionSub();
            selectionSub();
            await nameSub.unsubscribe();
            await descriptionSub.unsubscribe();
          });
        },
      });
    })
  }

  currentTab = 'pages';
  resourcesListView = new View({
    key: 'resources-side-bar',
    initialValue: {
      title: "Resources",
      position: 'primary',
      icon: { name: "VscFiles" },
      description: "Show the project resources in one place",
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
                opened: true,
                children: true,
                label: projectName,
                icon: { name: 'VscRootFolderOpened' },
                description: projectDescription || '',
                onItemClick: async () => {
                  await this.application.selection.select(projectId);
                },
                getItems: async () => [
                  new ListViewItem({
                    key: 'pages-group',
                    initialValue: {
                      opened: true,
                      label: 'Pages',
                      children: true,
                      disableSelect: true,
                      icon: { name: 'VscWindow' },
                      getItems: async () => {
                        const items = await this.loadPages(ref.collection('pages'))
                        return items;
                      },
                      getContextMenuItems: async () => {
                        return [
                          new ContextMenuItem({
                            label: 'New page',
                            icon: { name: 'VscNewFile' },
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
                            icon: { name: 'VscNewFolder' },
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
                      const itemsSub = await ref.collection('pages').onValue(() => context.refetchChildren());

                      context.onDidUnmount(async () => {
                        await itemsSub.unsubscribe();
                      });
                    }
                  }),
                  new ListViewItem({
                    key: 'shared-group',
                    initialValue: {
                      opened: true,
                      children: true,
                      label: 'Shared',
                      disableSelect: true,
                      icon: { name: 'VscFileSubmodule' },
                      getItems: async () => [
                        new ListViewItem({
                          key: 'components-group',
                          initialValue: {
                            children: true,
                            label: 'Components',
                            disableSelect: true,
                            icon: { name: 'VscRuby' },
                            getItems: async () => {
                              const items = await this.loadComponents(ref.collection('components'))
                              return items;
                            },
                            getContextMenuItems: async () => {
                              return [
                                new ContextMenuItem({
                                  label: 'New component',
                                  icon: { name: 'VscNewFile' },
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
                                  icon: { name: 'VscNewFolder' },
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
                          onDidMount: async (context) => {
                            const itemsSub = await ref.collection('components').onValue(() => context.refetchChildren());

                            context.onDidUnmount(async () => {
                              await itemsSub.unsubscribe();
                            });
                          },
                        }),
                        new ListViewItem({
                          key: 'actions-group',
                          initialValue: {
                            children: true,
                            label: 'Actions',
                            disableSelect: true,
                            icon: { name: 'VscSymbolMethod' },
                            getItems: async () => {
                              const items = await this.loadActions(ref.collection('actions'))
                              return items;
                            },
                            getContextMenuItems: async () => {
                              return [
                                new ContextMenuItem({
                                  label: 'New action',
                                  icon: { name: 'VscNewFile' },
                                  key: `new-action:${projectId}`,
                                  description: 'Add to this folder a new action',
                                  onClick: async () => {
                                    const name = await this.application.commands.editor.showQuickPick({
                                      title: 'Action name?',
                                      placeholder: 'Example: Action1',
                                      helpText: 'Type the name of the action.',
                                    });
                                    if (!name) return;

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
                                  key: `new-folder:${projectId}`,
                                  description: 'Add to this folder a new folder',
                                  onClick: async () => {
                                    const name = await this.application.commands.editor.showQuickPick({
                                      title: 'Folder name',
                                      placeholder: 'Example: Folder1',
                                      helpText: 'Type the name of the folder.',
                                    });
                                    if (!name) return;

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
                            const itemsSub = await ref.collection('pages').onValue(() => context.refetchChildren());

                            context.onDidUnmount(async () => {
                              await itemsSub.unsubscribe();
                            });
                          },
                        }),
                        new ListViewItem({
                          key: 'variables-group',
                          initialValue: {
                            children: true,
                            label: 'Variables',
                            disableSelect: true,
                            getItems: async () => [],
                            icon: { name: 'VscSymbolVariable' },
                          },
                        }),
                        new ListViewItem({
                          key: 'integrations-group',
                          initialValue: {
                            children: true,
                            disableSelect: true,
                            label: 'Integrations',
                            getItems: async () => [],
                            icon: { name: 'VscJson' },
                          },
                        }),
                        new ListViewItem({
                          key: 'structures-group',
                          initialValue: {
                            children: true,
                            label: 'Structures',
                            disableSelect: true,
                            getItems: async () => [],
                            icon: { name: 'VscSymbolInterface' },
                          },
                        }),
                        new ListViewItem({
                          key: 'assets-group',
                          initialValue: {
                            children: true,
                            label: 'Assets',
                            disableSelect: true,
                            getItems: async () => [],
                            icon: { name: 'VscAttach' },
                          },
                        }),
                        new ListViewItem({
                          key: 'dependencies-group',
                          initialValue: {
                            children: true,
                            disableSelect: true,
                            label: 'Dependencies',
                            icon: { name: 'VscDebugDisconnect' },
                            getItems: async () => [],
                          },
                        }),
                      ],
                    },
                  })
                ],
              },
              onDidMount: async (context) => {
                const selectionIds = await this.application.selection.get();
                context.select(selectionIds.includes(projectId));

                const nameSub = await ref.field('name').onValue(value => context.set('label', value));
                const selectionSub = this.application.selection.subscribe(key => context.select(key.includes(projectId)));
                const descriptionSub = await ref.field('description').onValue(value => context.set('description', value || ''));

                context.onDidUnmount(async () => {
                  selectionSub();
                  await nameSub.unsubscribe();
                  await descriptionSub.unsubscribe();
                });
              }
            }),
          ];
        },
      })
    },
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
