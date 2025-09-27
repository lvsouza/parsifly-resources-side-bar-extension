import { ExtensionBase, TabsView, ListProvider, Action, TabView, ListViewItem, IPage, IComponent, IService } from 'parsifly-extension-base';

// Envs.DEBUG = true;


new class Extension extends ExtensionBase {

  getChildrenByItemKey(items: (IPage | IComponent | IService)[], key?: string, itemIcon?: string): ListViewItem[] {
    const result: ListViewItem[] = [];

    const currentLevel = key ? key.split('/') : [];
    const seenFolders = new Set<string>();

    for (const item of items) {
      const folders = item.folders ?? [];

      // Root: páginas sem folders
      if (!key && folders.length === 0) {
        result.push(
          new ListViewItem({
            key: item.id,
            icon: itemIcon,
            label: item.name,
            children: false,
            draggable: true,
            draggableData: {
              id: item.id,
              type: item.type,
              label: item.name,
            }
          })
        );
        continue;
      }

      // Confere se a pasta atual bate com o nível
      const match = folders.slice(0, currentLevel.length).join('/') === currentLevel.join('/');

      if (!match) continue;

      const next = folders[currentLevel.length];

      // Página diretamente neste nível
      if (folders.length === currentLevel.length) {
        result.push(
          new ListViewItem({
            key: item.id,
            icon: itemIcon,
            label: item.name,
            children: false,
            draggable: true,
            draggableData: {
              id: item.id,
              type: item.type,
              label: item.name,
            }
          })
        );
      }

      // Subpasta
      if (next) {
        const fullPath = [...currentLevel, next].join('/');
        if (!seenFolders.has(fullPath)) {
          result.push(
            new ListViewItem({
              key: fullPath,
              label: next,
              icon: 'VscFolder',
              children: true,
            })
          );
          seenFolders.add(fullPath);
        }
      }
    }

    return result;
  }

  resourcesListView = new TabsView({
    key: 'resources-side-bar',
    actions: [
      new Action({
        key: 'add-resources',
        action: async () => {
          console.log('Add resource');

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
            this.application.dataProviders.project.pages.add({
              name: name,
              folders: [],
              type: 'page',
              description: '',
              id: crypto.randomUUID(),
            });
          } else if (type === 'component') {
            this.application.dataProviders.project.components.add({
              name: name,
              folders: [],
              description: '',
              type: 'component',
              id: crypto.randomUUID(),
            });
          } else if (type === 'service') {
            this.application.dataProviders.project.services.add({
              name: name,
              folders: [],
              description: '',
              type: 'service',
              id: crypto.randomUUID(),
            });
          }

          this.application.views.refresh(this.resourcesListView);
        }
      }),
    ],
    tabs: [
      new TabView({
        key: 'tab-pages',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async (item) => {
            const pages = await this.application.dataProviders.project.pages();

            const result = this.getChildrenByItemKey(pages, item?.key, 'VscWindow');

            return result;
          },
          onItemClick: async (item) => {
            if (item.children) return;

            await this.application.editors.open(item.key);
          },
          onItemDoubleClick: async (item) => {
            if (item.children) return;

            await this.application.editors.close(item.key);
          }
        }),
      }),
      new TabView({
        key: 'tab-components',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async (item) => {
            const components = await this.application.dataProviders.project.components();
            const result = this.getChildrenByItemKey(components, item?.key, 'VscRuby');

            return result;
          },
          onItemClick: async (item) => {
            if (item.children) return;

            await this.application.selection.select(item.key);
          },
          onItemDoubleClick: async (item) => {
            if (item.children) return;

            await this.application.selection.unselect(item.key);
          }
        }),
      }),
      new TabView({
        key: 'tab-services',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async (item) => {
            const services = await this.application.dataProviders.project.services();
            const result = this.getChildrenByItemKey(services, item?.key, 'VscSymbolMethod');

            return result;
          },
          onItemClick: async (item) => {
            if (item.children) return;

            await this.application.editors.open(item.key);
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
