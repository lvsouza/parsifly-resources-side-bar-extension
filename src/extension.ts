import { ExtensionBase, ListProvider, ListViewItem, View } from 'parsifly-extension-base';
import { loadComponentsFolder } from './components/components';
import { loadStructuresFolder } from './structures/structures';
import { loadActionsFolder } from './actions/actions';
import { loadPagesFolder } from './pages/pages';

// Envs.DEBUG = true;


new class Extension extends ExtensionBase {

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
                  loadPagesFolder(this.application, ref),
                  new ListViewItem({
                    key: 'shared-group',
                    initialValue: {
                      opened: true,
                      children: true,
                      label: 'Shared',
                      disableSelect: true,
                      icon: { name: 'VscFileSubmodule' },
                      getItems: async () => [
                        loadComponentsFolder(this.application, ref),
                        loadActionsFolder(this.application, ref),
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
                        loadStructuresFolder(this.application, ref),
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
