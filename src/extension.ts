import { ExtensionBase, TabsView, ListProvider, Action, TabView, Envs } from '@pb/extension-basics';

// Envs.DEBUG = true;

new class Extension extends ExtensionBase {
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
            console.log('item', item);

            const pages = await this.application.dataProviders.project.pages();
            console.log('pages', pages);

            return pages.map((page: any) => ({
              key: page.id,
              label: page.name,
              icon: 'VscWindow',
            }));
          },
        }),
      }),
      new TabView({
        key: 'tab-components',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async (item) => {
            console.log('item', item);

            const components = await this.application.dataProviders.project.components();
            console.log('components', components);

            return components.map((page: any) => ({
              key: page.id,
              label: page.name,
              icon: 'VscRuby',
            }));
          },
        }),
      }),
      new TabView({
        key: 'tab-services',
        dataProvider: new ListProvider({
          key: 'data-provider',
          getItems: async (item) => {
            console.log('item', item);

            const services = await this.application.dataProviders.project.services();
            console.log('services', services);

            return services.map((page: any) => ({
              key: page.id,
              label: page.name,
              icon: 'VscSymbolMethod',
            }));
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
