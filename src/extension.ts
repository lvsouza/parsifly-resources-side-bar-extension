import { ExtensionBase, TabsView, ListProvider, Action, TabView, ListViewItem, IPage, IComponent, IService, IProject, TProjectType, IFolder } from 'parsifly-extension-base';

// Envs.DEBUG = true;


new class Extension extends ExtensionBase {

  loadPages(content: (IPage | IFolder<IPage>)[]): ListViewItem[] {
    return content.map(item => {
      if (item.type === 'folder') {
        return new ListViewItem({
          key: item.id,
          children: true,
          label: item.name,
          icon: 'VscFolder',
          getItems: async () => {
            const items = this.loadPages(item.content)
            return items
          },
          onItemClick: async () => {
            await this.application.selection.select(item.id);
          },
          onItemDoubleClick: async () => {
            await this.application.edition.open(item.id);
          }
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
        }
      });
    })
  }

  loadComponents(content: (IComponent | IFolder<IComponent>)[]): ListViewItem[] {
    return content.map(item => {
      if (item.type === 'folder') {
        return new ListViewItem({
          key: item.id,
          children: true,
          label: item.name,
          icon: 'VscFolder',
          getItems: async () => {
            const items = this.loadComponents(item.content)
            return items
          },
          onItemClick: async () => {
            await this.application.selection.select(item.id);
          },
          onItemDoubleClick: async () => {
            await this.application.edition.open(item.id);
          }
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
        }
      });
    })
  }

  loadServices(content: (IService | IFolder<IService>)[]): ListViewItem[] {
    return content.map(item => {
      if (item.type === 'folder') {
        return new ListViewItem({
          key: item.id,
          children: true,
          label: item.name,
          icon: 'VscFolder',
          getItems: async () => {
            const items = this.loadServices(item.content)
            return items
          },
          onItemClick: async () => {
            await this.application.selection.select(item.id);
          },
          onItemDoubleClick: async () => {
            await this.application.edition.open(item.id);
          }
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
        }
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
            const pages = await this.application.dataProviders.project().collection<IProject<TProjectType>['pages'][number]>('pages').value();
            const items = this.loadPages(pages)
            return items
          },
        }),
      }),
      new TabView({
        key: 'tab-components',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async () => {
            const components = await this.application.dataProviders.project().collection<IComponent>('components').value();

            return components.map(component => (
              new ListViewItem({
                icon: 'VscRuby',
                children: false,
                draggable: true,
                key: component.id,
                label: component.name,
                draggableData: {
                  id: component.id,
                  type: component.type,
                  label: component.name,
                },
                onItemClick: async () => {
                  await this.application.selection.select(component.id);
                },
                onItemDoubleClick: async () => {
                  await this.application.edition.open(component.id);
                }
              })
            ));
          },
        }),
      }),
      new TabView({
        key: 'tab-services',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async () => {
            const services = await this.application.dataProviders.project().collection<IService>('services').value();

            return services.map(service => (
              new ListViewItem({
                children: false,
                draggable: true,
                key: service.id,
                label: service.name,
                icon: 'VscSymbolMethod',
                draggableData: {
                  id: service.id,
                  type: service.type,
                  label: service.name,
                },
                onItemClick: async () => {
                  await this.application.selection.select(service.id);
                },
                onItemDoubleClick: async () => {
                  await this.application.edition.open(service.id);
                }
              })
            ));
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
