import { ExtensionBase, TView, } from '@pb/extension-basics';


new class Extension extends ExtensionBase {
  views: TView[] = [
    {
      key: 'resources-side-bar',
      actions: [
        {
          key: 'add-resources',
          action: async () => {
            const type = await this.application.commands.editor.showQuickPick({
              placeholder: 'Example: page',
              helpText: 'Opções: page, component or service',
              title: 'Witch type of resource do you want to create?',
            });
            if (type === undefined) return;

            switch (type) {
              case 'page':
                const pageName = await this.application.commands.editor.showQuickPick({
                  placeholder: 'Example: Page1',
                  helpText: 'Write here the page name',
                  title: 'Witch is the name of the page?',
                });
                await this.application.commands.editor.feedback(`A page with name "${pageName}" was created`, 'success');
                break;
              case 'component':
                const componentName = await this.application.commands.editor.showQuickPick({
                  placeholder: 'Example: Component1',
                  helpText: 'Write here the component name',
                  title: 'Witch is the name of the component?',
                });
                await this.application.commands.editor.feedback(`A component with name "${componentName}" was created`, 'success');
                break;
              case 'service':
                const serviceName = await this.application.commands.editor.showQuickPick({
                  placeholder: 'Example: Service1',
                  helpText: 'Write here the service name',
                  title: 'Witch is the name of the service?',
                });
                await this.application.commands.editor.feedback(`A service with name "${serviceName}" was created`, 'success');
                break;

              default:
                await this.application.commands.editor.feedback(`Type of resource "${type}" not found.`, 'error');
                break;
            }
          },
        },
      ],
    },
  ];


  activate() {
    console.log('EXTENSION: Activating');

    this.application.commands.editor.showPrimarySideBarByKey('resources-side-bar');

    this.application.dataProviders.project.pages().then(pages => {
      this.application.commands.editor.setSideBarItems(
        'resources-side-bar',
        pages.map((page: any) => ({
          key: page.id,
          label: page.name,
          icon: 'VscWindow',
        }))
      );
    });
  }

  deactivate() {
    console.log('EXTENSION: Deactivating');
  }
};
