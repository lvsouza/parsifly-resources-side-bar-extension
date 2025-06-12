import { ExtensionBase, TabsView, ListProvider, Action, TabView, ListViewItem } from '@pb/extension-basics';

// Envs.DEBUG = true;

type Page = {
  id: string;
  name: string;
  folders?: string[];
};


new class Extension extends ExtensionBase {

  getChildrenByItemKey(items: Page[], key?: string, itemIcon?: string): ListViewItem[] {
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
            children: false
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
            children: false
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
              children: true
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
        }),
      }),
    ],
  });


  async activate() {
    console.log('EXTENSION: Activating');

    await this.application.views.register(this.resourcesListView);

    await this.application.commands.editor.showPrimarySideBarByKey('resources-side-bar');
  }

  async deactivate() {
    console.log('EXTENSION: Deactivating');

    await this.application.views.unregister(this.resourcesListView);
  }
};
